import os
import google.generativeai as genai
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from cachetools import TTLCache
import google.api_core.exceptions
from time import sleep
import json
import uuid
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError, DuplicateKeyError
import requests
import traceback
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# CORS configuration
CORS(
    app,
    origins=os.getenv("FRONTEND_URL", "https://pathforge-rkgq.onrender.com").split(","),
    supports_credentials=True,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"]
)

# Configure rate limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri=os.getenv("REDIS_URL", "memory://")
)

# Configure cache: 1 hour TTL, max 100 items
cache = TTLCache(maxsize=100, ttl=3600)

# Custom exceptions
class AppError(Exception):
    """Base exception for application errors"""
    pass

class AssessmentError(AppError):
    """Exception for assessment-related errors"""
    pass

class RoadmapError(AppError):
    """Exception for roadmap generation errors"""
    pass

# Configure MongoDB
def init_mongodb():
    """Initialize MongoDB connection with proper error handling"""
    try:
        mongo_uri = os.getenv("MONGO_URI")
        if not mongo_uri:
            raise ValueError("MONGO_URI environment variable is required")
        
        client = MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=5000,
            maxPoolSize=50,
            minPoolSize=10,
            maxIdleTimeMS=45000
        )
        
        db = client["skilling_tracker"]
        roadmaps_collection = db["roadmaps"]
        progress_collection = db["progress"]
        ai_chats_collection = db["ai_chats"]

        # Create indexes
        try:
            existing_indexes = roadmaps_collection.index_information()
            
            # Handle user_id index
            if "user_id_1" in existing_indexes:
                if not existing_indexes["user_id_1"].get("unique", False):
                    logger.info("Dropping old non-unique user_id index...")
                    roadmaps_collection.drop_index("user_id_1")
            
            roadmaps_collection.create_index("user_id", unique=True, name="user_id_unique")
            
            # Drop problematic index if exists
            if "roadmapId_1" in existing_indexes:
                logger.info("Dropping problematic roadmapId_1 index...")
                roadmaps_collection.drop_index("roadmapId_1")

            # Create other indexes
            progress_collection.create_index(
                [("user_id", 1), ("roadmap_id", 1)], 
                name="user_roadmap_idx"
            )
            progress_collection.create_index("step_id", name="step_id_idx")
            ai_chats_collection.create_index("userId", name="userId_idx")
            
            logger.info("Database indexes created successfully")

        except Exception as idx_error:
            logger.warning(f"Index creation warning (non-critical): {str(idx_error)}")

        # Test connection
        client.admin.command("ping")
        logger.info("MongoDB connected successfully")
        
        return client, db, roadmaps_collection, progress_collection, ai_chats_collection

    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected MongoDB error: {str(e)}")
        raise

# Initialize database
try:
    client, db, roadmaps_collection, progress_collection, ai_chats_collection = init_mongodb()
except Exception as e:
    logger.error(f"Failed to initialize database: {str(e)}")
    raise

# Configure Gemini API
def init_gemini_api():
    """Initialize Gemini API with proper validation"""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is required")
    
    try:
        genai.configure(api_key=api_key)
        logger.info("Gemini API configured successfully")
    except Exception as e:
        logger.error(f"Failed to configure Gemini API: {str(e)}")
        raise

init_gemini_api()

# Global error handlers
@app.errorhandler(AppError)
def handle_app_error(error):
    """Handle custom application errors"""
    logger.error(f"Application error: {str(error)}")
    return jsonify({
        "success": False,
        "message": str(error),
        "error_type": error.__class__.__name__
    }), 400

@app.errorhandler(500)
def handle_internal_error(error):
    """Handle internal server errors"""
    logger.error(f"Internal error: {str(error)}")
    traceback.print_exc()
    return jsonify({
        "success": False,
        "message": "Internal server error"
    }), 500

@app.errorhandler(404)
def handle_not_found(error):
    """Handle 404 errors"""
    return jsonify({
        "success": False,
        "message": "Resource not found"
    }), 404

# Helper functions
def list_available_models():
    """List available Gemini models"""
    try:
        models = genai.list_models()
        available_models = [
            model.name for model in models 
            if 'generateContent' in model.supported_generation_methods
        ]
        logger.info(f"Available Gemini models: {available_models}")
        return available_models
    except Exception as e:
        logger.error(f"Error listing models: {str(e)}")
        return []

def fetch_assessment_data(user_id, token=None):
    """Fetch assessment data from Node.js API"""
    try:
        nodejs_url = os.getenv("BACKEND_URL", "http://localhost:3000")
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        logger.info(f"Fetching assessment for user {user_id}")
        
        response = requests.get(
            f"{nodejs_url}/api/userinterest/status",
            params={'userId': user_id},
            headers=headers,
            cookies=request.cookies,
            timeout=10
        )

        logger.info(f"Assessment API Response: Status {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            if not data.get("success"):
                logger.warning(f"Node.js API returned success: false - {data.get('message')}")
                return []
            
            # Try different response formats
            assessment_data = (
                data.get("data", {}).get("starterAnswers") or
                data.get("mentalHealthAnswers") or
                []
            )
            
            if assessment_data:
                logger.info(f"Fetched {len(assessment_data)} assessment answers for user {user_id}")
                return assessment_data
            
            if data.get("hasCompletedAssessment"):
                logger.warning(f"Assessment completed but no answers returned for user {user_id}")
                return [{"questionText": "Unknown", "selectedOption": "Assessment completed"}]
            
            logger.warning(f"No assessment data found for user {user_id}")
            return []
        else:
            logger.warning(f"Failed to fetch assessment: Status {response.status_code}")
            return []

    except requests.exceptions.Timeout:
        logger.error(f"Timeout fetching assessment for user {user_id}")
        return []
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching assessment for user {user_id}: {str(e)}")
        return []

def get_available_model():
    """Get first available Gemini model"""
    model_names = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"]
    
    for model_name in model_names:
        try:
            model = genai.GenerativeModel(model_name)
            logger.info(f"Using model: {model_name}")
            return model
        except Exception as e:
            logger.warning(f"Model {model_name} not available: {str(e)}")
    
    # Try any available model
    available = list_available_models()
    if available:
        model_name = available[0]
        logger.info(f"Falling back to model: {model_name}")
        return genai.GenerativeModel(model_name)
    
    raise RoadmapError("No AI models available")

def build_roadmap_prompt(assessment_data):
    """Build prompt for AI roadmap generation"""
    if assessment_data and len(assessment_data) > 0:
        assessment_text = "\n".join([
            f"Q: {item.get('questionText', item.get('question', 'Unknown'))}\n"
            f"A: {item.get('selectedOption', item.get('answer', 'No answer'))}"
            for item in assessment_data
        ])
        
        return f"""Generate a personalized vocational training roadmap aligned with India's NSQF framework based on this user's career assessment.

USER ASSESSMENT:
{assessment_text}

Requirements:
- JSON array of 6-8 progressive steps
- Each step includes:
  - step_id: unique identifier (format: "step_1", "step_2", etc.)
  - name: clear, actionable step name
  - nsqf_level: NSQF level 1-10 (progressive)
  - description: 2-3 sentences about what they'll learn
  - duration: realistic timeframe (e.g., "2 weeks", "1 month")
  - resources: 3-4 specific Indian training resources (e.g., NIELIT, PMKVY, SWAYAM)
  - skills: 2-3 key skills gained
  - completed: false
- Focus on employable skills for Indian job market (e.g., IT, healthcare, manufacturing)
- Include relevant certifications
- Ensure steps are actionable and progressive
- Return ONLY valid JSON array"""
    else:
        return """Generate a general vocational training roadmap for Indian youth aligned with NSQF framework.

Requirements:
- JSON array of 6 progressive steps
- Each step includes:
  - step_id: unique identifier
  - name, nsqf_level (1-10), description, duration, resources, skills, completed: false
- Focus on employable skills for Indian job market
- Return ONLY valid JSON array"""

def parse_roadmap_response(response_text):
    """Parse and validate AI response"""
    # Remove markdown code blocks
    response_text = response_text.strip()
    if response_text.startswith("```json"):
        response_text = response_text[7:-3].strip()
    elif response_text.startswith("```"):
        response_text = response_text[3:-3].strip()
    
    try:
        roadmap_steps = json.loads(response_text)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {str(e)}")
        raise RoadmapError("Failed to parse AI response")
    
    # Validate and normalize steps
    for i, step in enumerate(roadmap_steps):
        step.setdefault("step_id", f"step_{i+1}")
        step.setdefault("completed", False)
        step.setdefault("skills", [])
        step.setdefault("resources", [])
    
    return roadmap_steps

def generate_roadmap_from_assessment(assessment_data, user_id):
    """Generate roadmap using Gemini AI"""
    cache_key = f"roadmap:{user_id}:{hash(str(assessment_data))}"
    
    # Check cache
    if cache_key in cache:
        logger.info(f"Cache hit for roadmap: {cache_key}")
        return cache[cache_key], False

    try:
        prompt = build_roadmap_prompt(assessment_data)
        model = get_available_model()

        max_retries = 3
        retry_delay = 5

        for attempt in range(max_retries):
            try:
                response = model.generate_content(prompt)
                roadmap_steps = parse_roadmap_response(response.text)

                # Cache result
                cache[cache_key] = roadmap_steps
                logger.info(f"Generated roadmap with {len(roadmap_steps)} steps for user {user_id}")
                return roadmap_steps, False

            except google.api_core.exceptions.ResourceExhausted:
                if attempt < max_retries - 1:
                    logger.warning(f"Rate limit hit, retrying in {retry_delay}s...")
                    sleep(retry_delay)
                    retry_delay *= 2
                else:
                    logger.error("Exhausted retries due to quota limit")
                    raise RoadmapError("AI service quota exceeded")
                    
            except json.JSONDecodeError:
                logger.error("Failed to parse AI response")
                break
                
            except Exception as e:
                logger.error(f"Model error: {str(e)}")
                if attempt < max_retries - 1:
                    try:
                        model = get_available_model()
                    except RoadmapError:
                        break
                else:
                    break

    except Exception as e:
        logger.error(f"Error generating roadmap: {str(e)}")

    # Fallback to default roadmap
    logger.info("Using fallback roadmap")
    return generate_fallback_roadmap(assessment_data), True

def generate_fallback_roadmap(assessment_data):
    """Generate fallback roadmap when AI is unavailable"""
    logger.info("Generating fallback roadmap")
    
    is_manufacturing = any(
        item.get("selectedOption", "") == "Manufacturing & Engineering"
        for item in (assessment_data or [])
    )

    if is_manufacturing:
        return [
            {
                "step_id": "step_1",
                "name": "Basic Manufacturing Skills",
                "nsqf_level": 3,
                "description": "Learn foundational manufacturing processes, tools, and safety protocols for shop-floor roles.",
                "duration": "1 month",
                "resources": ["PMKVY Manufacturing Course", "NSDC Skill Training", "SWAYAM Industrial Skills", "ITI Manufacturing Modules"],
                "skills": ["Manufacturing Processes", "Workplace Safety", "Tool Handling"],
                "completed": False
            },
            {
                "step_id": "step_2",
                "name": "CNC Machine Operation",
                "nsqf_level": 4,
                "description": "Master CNC machine operation and basic programming for precision manufacturing.",
                "duration": "2 months",
                "resources": ["PMKVY CNC Operator Course", "NIELIT CNC Training", "SWAYAM CAD/CAM Basics", "NSDC Skill Centers"],
                "skills": ["CNC Operation", "Basic CAD/CAM", "Precision Manufacturing"],
                "completed": False
            },
            {
                "step_id": "step_3",
                "name": "Introduction to Automation",
                "nsqf_level": 4,
                "description": "Understand industrial automation, PLC basics, and IoT applications in manufacturing.",
                "duration": "6 weeks",
                "resources": ["Siemens Mechatronics Certification", "PMKVY Automation Course", "SWAYAM IoT Basics", "NIELIT PLC Training"],
                "skills": ["PLC Basics", "Industrial Automation", "IoT Awareness"],
                "completed": False
            }
        ]
    else:
        return [
            {
                "step_id": "step_1",
                "name": "Digital Literacy Basics",
                "nsqf_level": 1,
                "description": "Master basic computer operations, MS Office, and internet navigation for professional use.",
                "duration": "2 weeks",
                "resources": ["NIELIT CCC Course", "Microsoft Digital Literacy", "Skill India Portal"],
                "skills": ["Computer Basics", "MS Office", "Internet Navigation"],
                "completed": False
            },
            {
                "step_id": "step_2",
                "name": "Career Path Exploration",
                "nsqf_level": 2,
                "description": "Explore career options and understand industry requirements in India.",
                "duration": "1 week",
                "resources": ["SWAYAM Career Guidance", "NSDC Skill Finder", "LinkedIn Learning"],
                "skills": ["Career Planning", "Industry Awareness"],
                "completed": False
            },
            {
                "step_id": "step_3",
                "name": "Foundational IT Skills",
                "nsqf_level": 3,
                "description": "Learn basic programming concepts and IT fundamentals to prepare for technical roles.",
                "duration": "2 months",
                "resources": ["PMKVY IT Courses", "NIELIT IT Literacy", "Coursera IT Fundamentals"],
                "skills": ["Basic Programming", "IT Fundamentals"],
                "completed": False
            }
        ]

def generate_career_advice(user_message, user_id, assessment_data=None):
    """Generate AI career advice"""
    try:
        prompt = "You are a career counselor for Indian youth aligned with NSQF framework.\n"
        
        if assessment_data and len(assessment_data) > 0:
            assessment_summary = "\n".join([
                f"- {item.get('questionText', item.get('question', 'Q'))}: "
                f"{item.get('selectedOption', item.get('answer', 'N/A'))}"
                for item in assessment_data[:5]
            ])
            prompt += f"USER ASSESSMENT:\n{assessment_summary}\n"
        
        prompt += f"USER QUESTION: {user_message}\n"
        prompt += """Provide personalized career advice with:
- Actionable steps
- Relevant Indian training programs (NIELIT, PMKVY, etc.)
- NSQF-aligned certifications
- Focus on employability in Indian job market
Keep response concise (200-300 words) and encouraging.
End with: "For personalized guidance, consult a career counselor." """

        model = get_available_model()
        response = model.generate_content(prompt)
        logger.info(f"Generated career advice for user {user_id}")
        return response.text.strip()

    except Exception as e:
        logger.error(f"Error in career advice: {str(e)}")
        return ("I'm here to help with career guidance! Could you please rephrase your question? "
                "For personalized guidance, consult a career counselor.")

# Routes
@app.route("/api/test", methods=["GET", "OPTIONS"])
@limiter.exempt
def test_route():
    """Test endpoint"""
    return jsonify({"success": True, "message": "Server is running"}), 200

@app.route("/health", methods=["GET", "OPTIONS"])
@limiter.exempt
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Skilling Progress Tracker & AI Career Advisor",
        "timestamp": datetime.now().isoformat()
    }), 200

@app.route("/api/roadmap/generate", methods=["POST", "OPTIONS"])
@limiter.limit("5 per minute")
def generate_roadmap():
    """Generate personalized roadmap"""
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "Request body is required"}), 400
        
        user_id = data.get("user_id") or data.get("userId")
        token = request.headers.get("Authorization", "").replace("Bearer ", "")

        if not user_id:
            return jsonify({"success": False, "message": "user_id is required"}), 400

        # Fetch assessment data
        assessment_data = fetch_assessment_data(user_id, token)
        if not assessment_data:
            return jsonify({
                "success": False,
                "message": "No assessment found. Please complete the career assessment first.",
                "redirect": "/assessment"
            }), 404

        # Generate roadmap
        roadmap_steps, is_fallback = generate_roadmap_from_assessment(assessment_data, user_id)
        roadmap_id = str(uuid.uuid4())

        roadmap_doc = {
            "roadmap_id": roadmap_id,
            "user_id": user_id,
            "steps": roadmap_steps,
            "assessment_summary": assessment_data[:3] if assessment_data else [],
            "is_fallback": is_fallback,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        # Save to database
        try:
            roadmaps_collection.replace_one(
                {"user_id": user_id},
                roadmap_doc,
                upsert=True
            )
            logger.info(f"Roadmap saved for user {user_id} (Fallback: {is_fallback})")
        except DuplicateKeyError:
            logger.error("Duplicate key error while saving roadmap")
            # Continue anyway, return the generated roadmap

        return jsonify({
            "success": True,
            "message": "Roadmap generated successfully" if not is_fallback else "Roadmap generated using fallback mode",
            "data": {
                "roadmap_id": roadmap_id,
                "user_id": user_id,
                "steps": roadmap_steps,
                "total_steps": len(roadmap_steps),
                "is_fallback": is_fallback
            }
        }), 201

    except Exception as e:
        logger.error(f"Error generating roadmap: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "message": "Failed to generate roadmap"}), 500

@app.route("/api/roadmap/<user_id>", methods=["GET", "OPTIONS"])
@limiter.limit("20 per minute")
def get_roadmap(user_id):
    """Get user's roadmap"""
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200
    
    try:
        start_time = datetime.now()
        
        roadmap = roadmaps_collection.find_one({"user_id": user_id})
        if not roadmap:
            return jsonify({"success": False, "message": "No roadmap found"}), 404

        # Get progress
        progress_records = list(progress_collection.find({"user_id": user_id}))
        completed_step_ids = {p["step_id"] for p in progress_records if p.get("completed")}

        # Update step completion status
        steps = roadmap["steps"]
        for step in steps:
            step["completed"] = step["step_id"] in completed_step_ids

        # Calculate progress
        total_steps = len(steps)
        completed_steps = len(completed_step_ids)
        progress_percentage = (completed_steps / total_steps * 100) if total_steps > 0 else 0

        query_duration = (datetime.now() - start_time).total_seconds()
        logger.info(f"Roadmap fetched for user {user_id} in {query_duration:.2f}s")
        
        return jsonify({
            "success": True,
            "data": {
                "roadmap_id": roadmap["roadmap_id"],
                "user_id": user_id,
                "steps": steps,
                "progress": {
                    "completed": completed_steps,
                    "total": total_steps,
                    "percentage": round(progress_percentage, 1)
                },
                "is_fallback": roadmap.get("is_fallback", False),
                "created_at": roadmap["created_at"].isoformat(),
                "updated_at": roadmap["updated_at"].isoformat()
            }
        }), 200

    except Exception as e:
        logger.error(f"Error fetching roadmap: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "message": "Failed to fetch roadmap"}), 500

@app.route("/api/progress/update", methods=["POST", "OPTIONS"])
@limiter.limit("20 per minute")
def update_progress():
    """Update step progress"""
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "Request body is required"}), 400
        
        user_id = data.get("user_id")
        step_id = data.get("step_id")
        completed = data.get("completed", True)

        if not user_id or not step_id:
            return jsonify({"success": False, "message": "user_id and step_id are required"}), 400

        # Verify roadmap exists
        roadmap = roadmaps_collection.find_one({"user_id": user_id})
        if not roadmap:
            return jsonify({"success": False, "message": "Roadmap not found"}), 404

        # Verify step exists
        step_exists = any(step["step_id"] == step_id for step in roadmap["steps"])
        if not step_exists:
            return jsonify({"success": False, "message": "Step not found in roadmap"}), 404

        # Update progress
        if completed:
            progress_doc = {
                "progress_id": str(uuid.uuid4()),
                "user_id": user_id,
                "roadmap_id": roadmap["roadmap_id"],
                "step_id": step_id,
                "completed": True,
                "completed_at": datetime.now()
            }
            progress_collection.update_one(
                {"user_id": user_id, "step_id": step_id},
                {"$set": progress_doc},
                upsert=True
            )
            message = "Step marked as completed"
        else:
            progress_collection.delete_one({"user_id": user_id, "step_id": step_id})
            message = "Step marked as incomplete"

        # Calculate new progress
        progress_records = list(progress_collection.find({"user_id": user_id}))
        completed_step_ids = {p["step_id"] for p in progress_records if p.get("completed")}
        total_steps = len(roadmap["steps"])
        completed_count = len(completed_step_ids)
        progress_percentage = (completed_count / total_steps * 100) if total_steps > 0 else 0

        logger.info(f"Progress updated for user {user_id}, step {step_id}")
        
        return jsonify({
            "success": True,
            "message": message,
            "data": {
                "step_id": step_id,
                "completed": completed,
                "progress": {
                    "completed": completed_count,
                    "total": total_steps,
                    "percentage": round(progress_percentage, 1)
                }
            }
        }), 200

    except Exception as e:
        logger.error(f"Error updating progress: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "message": "Failed to update progress"}), 500

@app.route("/api/ai-chat", methods=["POST", "OPTIONS"])
@limiter.limit("10 per minute")
def ai_chat():
    """AI career advice chat"""
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "Request body is required"}), 400
        
        user_message = data.get("message", "").strip()
        user_id = data.get("userId") or data.get("user_id")
        token = request.headers.get("Authorization", "").replace("Bearer ", "")

        if not user_message or not user_id:
            return jsonify({"success": False, "message": "message and user_id are required"}), 400

        # Fetch assessment for context
        assessment_data = fetch_assessment_data(user_id, token)
        
        # Generate advice
        ai_response = generate_career_advice(user_message, user_id, assessment_data)

        # Save chat history
        chat_messages = [
            {"role": "user", "content": user_message, "timestamp": datetime.now()},
            {"role": "assistant", "content": ai_response, "timestamp": datetime.now()}
        ]

        ai_chats_collection.update_one(
            {"userId": user_id},
            {
                "$push": {"messages": {"$each": chat_messages}},
                "$setOnInsert": {"createdAt": datetime.now()}
            },
            upsert=True
        )

        logger.info(f"AI chat response generated for user {user_id}")
        
        return jsonify({
            "success": True,
            "response": ai_response,
            "type": "gemini_career_advice",
            "timestamp": datetime.now().isoformat()
        }), 200

    except Exception as e:
        logger.error(f"Error in AI chat: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "message": "Failed to get AI response"}), 500

@app.route("/api/ai-chat/history/<user_id>", methods=["GET", "OPTIONS"])
@limiter.limit("10 per minute")
def get_chat_history(user_id):
    """Get chat history"""
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200
    
    try:
        chat = ai_chats_collection.find_one({"userId": user_id})
        
        if not chat:
            return jsonify({
                "success": True,
                "data": {"userId": user_id, "messages": []}
            }), 200

        logger.info(f"Chat history fetched for user {user_id}")
        
        return jsonify({
            "success": True,
            "data": {
                "userId": user_id,
                "messages": chat.get("messages", [])
            }
        }), 200

    except Exception as e:
        logger.error(f"Error fetching chat history: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "message": "Failed to fetch chat history"}), 500

# Run application
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5002))
    logger.info(f"Starting Skilling Progress Tracker & AI Career Advisor on port {port}...")
    
    try:
        from waitress import serve
        logger.info("Using Waitress WSGI server")
        serve(app, host="0.0.0.0", port=port, threads=4)
    except ImportError:
        logger.warning("Waitress not installed. Using Flask development server")
        logger.warning("For production, install Waitress: pip install waitress")
        app.run(host="0.0.0.0", port=port, debug=False)