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
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

CORS(app, origins="*", supports_credentials=True)



# Configure rate limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri=os.getenv("REDIS_URL", "memory://")
)

# Configure cache: 1 hour TTL, max 100 items
cache = TTLCache(maxsize=100, ttl=3600)

# Configure MongoDB
try:
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    db = client["skilling_tracker"]
    roadmaps_collection = db["roadmaps"]
    progress_collection = db["progress"]
    ai_chats_collection = db["ai_chats"]

    try:
        existing_indexes = roadmaps_collection.index_information()
        if "user_id_1" in existing_indexes:
            if not existing_indexes["user_id_1"].get("unique", False):
                logger.info("⚠️ Dropping old non-unique user_id index...")
                roadmaps_collection.drop_index("user_id_1")
                roadmaps_collection.create_index("user_id", unique=True, name="user_id_unique")
                logger.info("✅ Created new unique user_id index")
        else:
            roadmaps_collection.create_index("user_id", unique=True, name="user_id_unique")

        # Drop problematic roadmapId index if it exists
        if "roadmapId_1" in existing_indexes:
            logger.info("⚠️ Dropping problematic roadmapId_1 index...")
            roadmaps_collection.drop_index("roadmapId_1")
            logger.info("✅ Dropped roadmapId_1 index")

        progress_collection.create_index([("user_id", 1), ("roadmap_id", 1)], name="user_roadmap_idx")
        progress_collection.create_index("step_id", name="step_id_idx")
        ai_chats_collection.create_index("userId", name="userId_idx")

    except Exception as idx_error:
        logger.warning(f"⚠️ Index creation warning (non-critical): {str(idx_error)}")

    client.admin.command("ping")
    logger.info("✅ MongoDB connected successfully")

except (ConnectionFailure, ServerSelectionTimeoutError) as e:
    logger.error(f"❌ Failed to connect to MongoDB: {str(e)}")
    raise
except Exception as e:
    logger.error(f"❌ Unexpected MongoDB error: {str(e)}")
    raise

# Configure Gemini API
try:
    genai.configure(api_key="AIzaSyAI7PV5c3WLfLdTH6RlYMlcvWJH99w4VMo")
    logger.info("✅ Gemini API configured successfully")
except Exception as e:
    logger.error(f"❌ Failed to configure Gemini API: {str(e)}")
    raise

# Debug route to confirm server is running
@app.route("/api/test", methods=["GET"])
def test_route():
    logger.info("📡 Test route hit")
    return jsonify({"success": True, "message": "Server is running"}), 200

# List available Gemini models
def list_available_models():
    try:
        models = genai.list_models()
        available_models = [model.name for model in models if 'generateContent' in model.supported_generation_methods]
        logger.info(f"✅ Available Gemini models: {available_models}")
        return available_models
    except Exception as e:
        logger.error(f"❌ Error listing models: {str(e)}")
        traceback.print_exc()
        return []

# Fetch assessment data from Node.js API
def fetch_assessment_data(user_id, token=None):
    try:
        nodejs_url = os.getenv("BACKEND_URL", "http://localhost:3000")
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        logger.info(f"🔑 Fetching assessment for user {user_id} with token: {'Present' if token else 'Missing'}")
        
        response = requests.get(
            f"{nodejs_url}/api/userinterest/status",
            params={'userId': user_id},
            headers=headers,
            cookies=request.cookies,
            timeout=5
        )

        logger.info(f"📡 Assessment API Response: Status {response.status_code}")
        logger.info(f"📊 Full response: {response.text}")

        if response.status_code == 200:
            data = response.json()
            if not data.get("success"):
                logger.warning(f"⚠️ Node.js API returned success: false - {data.get('message', 'No message')}")
                return []
            assessment_data = data.get("data", {}).get("starterAnswers", [])
            if assessment_data:
                logger.info(f"✅ Fetched {len(assessment_data)} starterAnswers for user {user_id}")
                return assessment_data
            assessment_data = data.get("mentalHealthAnswers", [])
            if assessment_data:
                logger.info(f"✅ Fetched {len(assessment_data)} mentalHealthAnswers for user {user_id}")
                return assessment_data
            if data.get("hasCompletedAssessment"):
                logger.warning(f"⚠️ Assessment completed but no answers returned for user {user_id}. Using placeholder.")
                return [{"questionText": "Unknown", "selectedOption": "Assessment completed"}]
            logger.warning(f"⚠️ No assessment data found for user {user_id}")
            return []
        else:
            logger.warning(f"⚠️ Failed to fetch assessment: Status {response.status_code}")
            return []

    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Error fetching assessment for user {user_id}: {str(e)}")
        traceback.print_exc()
        return []

# Generate roadmap using Gemini
def generate_roadmap_from_assessment(assessment_data, user_id):
    cache_key = f"roadmap:{user_id}:{hash(str(assessment_data))}"
    if cache_key in cache:
        logger.info(f"📦 Cache hit for roadmap: {cache_key}")
        return cache[cache_key], False

    try:
        if assessment_data and len(assessment_data) > 0:
            assessment_text = "\n".join([
                f"Q: {item.get('questionText', item.get('question', 'Unknown'))}\nA: {item.get('selectedOption', item.get('answer', 'No answer'))}"
                for item in assessment_data
            ])
            logger.info(f"📝 Assessment data for prompt: {assessment_text[:200]}...")

            prompt = f"""Generate a personalized vocational training roadmap aligned with India's NSQF framework based on this user's career assessment.

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
- Return ONLY valid JSON array
"""
        else:
            logger.warning("⚠️ No assessment data, using fallback roadmap")
            prompt = """Generate a general vocational training roadmap for Indian youth aligned with NSQF framework.

Requirements:
- JSON array of 6 progressive steps
- Each step includes:
  - step_id: unique identifier
  - name, nsqf_level (1-10), description, duration, resources, skills, completed: false
- Focus on employable skills for Indian job market
- Return ONLY valid JSON array
"""

        # Try models in order of preference
        model_names = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-2.0-pro"]
        model = None
        for model_name in model_names:
            try:
                model = genai.GenerativeModel(model_name)
                logger.info(f"✅ Using model: {model_name}")
                break
            except Exception as e:
                logger.warning(f"⚠️ Model {model_name} not available: {str(e)}")
        
        if not model:
            available_models = list_available_models()
            if not available_models:
                logger.error("❌ No available models found, using fallback roadmap")
                return generate_fallback_roadmap(assessment_data), True
            model_name = available_models[0]
            logger.info(f"🔄 Falling back to model: {model_name}")
            model = genai.GenerativeModel(model_name)

        max_retries = 3
        retry_delay = 5

        for attempt in range(max_retries):
            try:
                response = model.generate_content(prompt)
                response_text = response.text.strip()

                if response_text.startswith("```json"):
                    response_text = response_text[7:-3].strip()
                elif response_text.startswith("```"):
                    response_text = response_text[3:-3].strip()

                roadmap_steps = json.loads(response_text)

                for i, step in enumerate(roadmap_steps):
                    if "step_id" not in step:
                        step["step_id"] = f"step_{i+1}"
                    if "completed" not in step:
                        step["completed"] = False
                    if "skills" not in step:
                        step["skills"] = []
                    if "resources" not in step:
                        step["resources"] = []

                cache[cache_key] = roadmap_steps
                logger.info(f"✅ Generated roadmap with {len(roadmap_steps)} steps for user {user_id}")
                return roadmap_steps, False

            except google.api_core.exceptions.ResourceExhausted:
                if attempt < max_retries - 1:
                    logger.warning(f"⚠️ Rate limit hit, retrying in {retry_delay}s...")
                    sleep(retry_delay)
                    retry_delay *= 2
                else:
                    logger.error("❌ Exhausted retries due to quota limit")
                    raise
            except json.JSONDecodeError as e:
                logger.error(f"❌ JSON parsing error: {str(e)}")
                break
            except Exception as e:
                logger.error(f"❌ Model error: {str(e)}")
                if attempt < max_retries - 1:
                    available_models = list_available_models()
                    if not available_models:
                        logger.error("❌ No available models, using fallback roadmap")
                        return generate_fallback_roadmap(assessment_data), True
                    model_name = available_models[0]
                    logger.info(f"🔄 Retrying with model: {model_name}")
                    model = genai.GenerativeModel(model_name)
                else:
                    logger.error("❌ Exhausted retries, using fallback roadmap")
                    return generate_fallback_roadmap(assessment_data), True

    except Exception as e:
        logger.error(f"❌ Error generating roadmap: {str(e)}")
        traceback.print_exc()
        return generate_fallback_roadmap(assessment_data), True

# Fallback roadmap
def generate_fallback_roadmap(assessment_data):
    logger.info("📝 Generating fallback roadmap")
    # Check if assessment_data indicates Manufacturing & Engineering interest
    is_manufacturing = any(
        item.get("selectedOption", "") == "Manufacturing & Engineering"
        for item in assessment_data
    ) if assessment_data else False

    if is_manufacturing:
        logger.info("📝 Using Manufacturing & Engineering fallback roadmap")
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
        logger.info("📝 Using IT-focused fallback roadmap")
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

# Generate AI career advice
def generate_career_advice(user_message, user_id, assessment_data=None):
    try:
        prompt = "You are a career counselor for Indian youth aligned with NSQF framework.\n"
        if assessment_data and len(assessment_data) > 0:
            assessment_summary = "\n".join([
                f"- {item.get('questionText', item.get('question', 'Q'))}: {item.get('selectedOption', item.get('answer', 'N/A'))}"
                for item in assessment_data[:5]
            ])
            logger.info(f"📝 Career advice assessment data: {assessment_summary[:200]}...")
            prompt += f"USER ASSESSMENT:\n{assessment_summary}\n"
        
        prompt += f"USER QUESTION: {user_message}\n" if user_message else ""
        prompt += """Provide personalized career advice with:
- Actionable steps
- Relevant Indian training programs (NIELIT, PMKVY, etc.)
- NSQF-aligned certifications
- Focus on employability in Indian job market
Keep response concise (200-300 words) and encouraging.
End with: "💡 For personalized guidance, consult a career counselor."
"""

        model_names = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-2.0-pro"]
        model = None
        for model_name in model_names:
            try:
                model = genai.GenerativeModel(model_name)
                logger.info(f"✅ Using model: {model_name}")
                break
            except Exception as e:
                logger.warning(f"⚠️ Model {model_name} not available: {str(e)}")
        
        if not model:
            available_models = list_available_models()
            if not available_models:
                logger.error("❌ No available models, using fallback advice")
                return ("I'm here to help with career guidance! Could you please rephrase your question? "
                        "💡 For personalized guidance, consult a career counselor.")
            model_name = available_models[0]
            logger.info(f"🔄 Falling back to model: {model_name}")
            model = genai.GenerativeModel(model_name)

        response = model.generate_content(prompt)
        logger.info(f"✅ Generated career advice for user {user_id}")
        return response.text.strip()

    except Exception as e:
        logger.error(f"❌ Error in career advice: {str(e)}")
        traceback.print_exc()
        return ("I'm here to help with career guidance! Could you please rephrase your question? "
                "💡 For personalized guidance, consult a career counselor.")

# Endpoints
@app.route("/health", methods=["GET"])
def health_check():
    logger.info("📡 Health check hit")
    return jsonify({
        "status": "Skilling Progress Tracker & AI Career Advisor",
        "timestamp": datetime.now().isoformat()
    }), 200

@app.route("/api/progress/api/roadmap/generate", methods=["POST"])
@limiter.limit("5 per minute")
def generate_roadmap():
    try:
        logger.info(f"📡 Received POST /api/progress/api/roadmap/generate")
        data = request.get_json()
        user_id = data.get("user_id") or data.get("userId")
        token = request.headers.get("Authorization", "").replace("Bearer ", "")

        if not user_id:
            logger.error("❌ user_id is required")
            return jsonify({"success": False, "message": "user_id is required"}), 400

        logger.info(f"🔑 Generate roadmap token: {'Present' if token else 'Missing'}")

        assessment_data = fetch_assessment_data(user_id, token)
        if not assessment_data:
            logger.warning("⚠️ No assessment found for user")
            return jsonify({
                "success": False,
                "message": "No assessment found. Please complete the career assessment first.",
                "redirect": "/assessment"
            }), 404

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

        try:
            roadmaps_collection.replace_one(
                {"user_id": user_id},
                roadmap_doc,
                upsert=True
            )
            logger.info(f"✅ Roadmap saved for user {user_id} (Fallback: {is_fallback})")
        except DuplicateKeyError as e:
            logger.error(f"❌ Duplicate key error while saving roadmap: {str(e)}")
            # Return the generated roadmap even if saving fails
            logger.warning(f"⚠️ Returning generated roadmap without saving for user {user_id}")
            return jsonify({
                "success": True,
                "message": "Roadmap generated but could not be saved due to database error",
                "data": {
                    "roadmap_id": roadmap_id,
                    "user_id": user_id,
                    "steps": roadmap_steps,
                    "total_steps": len(roadmap_steps),
                    "is_fallback": is_fallback
                }
            }), 201

        return jsonify({
            "success": True,
            "message": "Roadmap generated successfully" if not is_fallback else "Generic roadmap generated due to API issues",
            "data": {
                "roadmap_id": roadmap_id,
                "user_id": user_id,
                "steps": roadmap_steps,
                "total_steps": len(roadmap_steps),
                "is_fallback": is_fallback
            }
        }), 201

    except Exception as e:
        logger.error(f"❌ Error generating roadmap: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "message": f"Failed to generate roadmap: {str(e)}"}), 500

@app.route("/api/progress/api/roadmap/<user_id>", methods=["GET"])
@limiter.limit("20 per minute")
def get_roadmap(user_id):
    try:
        logger.info(f"📡 Received GET /api/progress/api/roadmap/{user_id}")
        start_time = datetime.now()
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        logger.info(f"🔑 Get roadmap token: {'Present' if token else 'Missing'}")

        roadmap = roadmaps_collection.find_one({"user_id": user_id})
        if not roadmap:
            logger.warning(f"⚠️ No roadmap found for user {user_id}")
            return jsonify({"success": False, "message": "No roadmap found."}), 404

        progress_records = list(progress_collection.find({"user_id": user_id}))
        completed_step_ids = {p["step_id"] for p in progress_records if p.get("completed")}

        steps = roadmap["steps"]
        for step in steps:
            step["completed"] = step["step_id"] in completed_step_ids

        total_steps = len(steps)
        completed_steps = len(completed_step_ids)
        progress_percentage = (completed_steps / total_steps * 100) if total_steps > 0 else 0

        query_duration = (datetime.now() - start_time).total_seconds()
        logger.info(f"✅ Roadmap fetched for user {user_id} in {query_duration:.2f}s")
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
        logger.error(f"❌ Error fetching roadmap: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "message": f"Failed to fetch roadmap: {str(e)}"}), 500

@app.route("/api/progress/update", methods=["POST"])
@limiter.limit("20 per minute")
def update_progress():
    try:
        logger.info(f"📡 Received POST /api/progress/update")
        data = request.get_json()
        user_id = data.get("user_id")
        step_id = data.get("step_id")
        completed = data.get("completed", True)

        if not user_id or not step_id:
            logger.error("❌ user_id and step_id are required")
            return jsonify({"success": False, "message": "user_id and step_id are required"}), 400

        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        logger.info(f"🔑 Update progress token: {'Present' if token else 'Missing'}")

        roadmap = roadmaps_collection.find_one({"user_id": user_id})
        if not roadmap:
            logger.warning(f"⚠️ Roadmap not found for user {user_id}")
            return jsonify({"success": False, "message": "Roadmap not found"}), 404

        step_exists = any(step["step_id"] == step_id for step in roadmap["steps"])
        if not step_exists:
            logger.warning(f"⚠️ Step {step_id} not found in roadmap")
            return jsonify({"success": False, "message": "Step not found in roadmap"}), 404

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
            message = "Step marked as completed! 🎉"
        else:
            progress_collection.delete_one({"user_id": user_id, "step_id": step_id})
            message = "Step marked as incomplete"

        progress_records = list(progress_collection.find({"user_id": user_id}))
        completed_step_ids = {p["step_id"] for p in progress_records if p.get("completed")}
        total_steps = len(roadmap["steps"])
        completed_count = len(completed_step_ids)
        progress_percentage = (completed_count / total_steps * 100) if total_steps > 0 else 0

        logger.info(f"✅ Progress updated for user {user_id}, step {step_id}")
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
        logger.error(f"❌ Error updating progress: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "message": f"Failed to update progress: {str(e)}"}), 500

@app.route("/api/ai-chat", methods=["POST"])
@limiter.limit("10 per minute")
def ai_chat():
    try:
        logger.info(f"📡 Received POST /api/ai-chat")
        data = request.get_json()
        user_message = data.get("message", "").strip()
        user_id = data.get("userId") or data.get("user_id")
        token = request.headers.get("Authorization", "").replace("Bearer ", "")

        if not user_message or not user_id:
            logger.error("❌ message and user_id are required")
            return jsonify({"success": False, "message": "message and user_id are required"}), 400

        logger.info(f"🔑 AI chat token: {'Present' if token else 'Missing'}")

        assessment_data = fetch_assessment_data(user_id, token)
        ai_response = generate_career_advice(user_message, user_id, assessment_data)

        chat_doc = {
            "userId": user_id,
            "messages": [
                {"role": "user", "content": user_message, "timestamp": datetime.now()},
                {"role": "assistant", "content": ai_response, "timestamp": datetime.now()}
            ],
            "createdAt": datetime.now()
        }

        ai_chats_collection.update_one(
            {"userId": user_id},
            {"$push": {"messages": {"$each": chat_doc["messages"]}}},
            upsert=True
        )

        logger.info(f"✅ AI chat response generated for user {user_id}")
        return jsonify({
            "success": True,
            "response": ai_response,
            "type": "gemini_career_advice",
            "timestamp": datetime.now().isoformat()
        }), 200

    except Exception as e:
        logger.error(f"❌ Error in AI chat: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "message": f"Failed to get AI response: {str(e)}"}), 500

@app.route("/api/ai-chat/history/<user_id>", methods=["GET"])
@limiter.limit("10 per minute")
def get_chat_history(user_id):
    try:
        logger.info(f"📡 Received GET /api/ai-chat/history/{user_id}")
        chat = ai_chats_collection.find_one({"userId": user_id})
        if not chat:
            logger.warning(f"⚠️ No chat history found for user {user_id}")
            return jsonify({"success": True, "data": {"messages": []}}), 200

        logger.info(f"✅ Chat history fetched for user {user_id}")
        return jsonify({
            "success": True,
            "data": {
                "userId": user_id,
                "messages": chat.get("messages", [])
            }
        }), 200

    except Exception as e:
        logger.error(f"❌ Error fetching chat history: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500

# Explicit OPTIONS handlers for CORS preflight
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Headers', 'Authorization, Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

if __name__ == "__main__":
    logger.info("🚀 Starting Skilling Progress Tracker & AI Career Advisor on port 5002...")
    try:
        from waitress import serve
        serve(app, host="0.0.0.0", port=5002, threads=4)
    except ImportError:
        logger.warning("⚠️ Waitress not installed. Falling back to Flask dev server")
        app.run(host="0.0.0.0", port=5002, debug=True, use_reloader=False)