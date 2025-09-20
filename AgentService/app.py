import os
import google.generativeai as genai
from datetime import datetime
import requests
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from cachetools import TTLCache
import google.api_core.exceptions
from time import sleep

# -----------------------------
# Initialize Flask app
# -----------------------------
app = Flask(__name__)

# Configure CORS to allow requests from frontend
CORS(app, origins=['http://localhost:5173'], supports_credentials=True)

# Configure rate limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"]
)

# Configure cache: 1 hour TTL, max 100 items
cache = TTLCache(maxsize=100, ttl=3600)

# Configure Gemini API
try:
    genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
    print("✅ Gemini API configured successfully")
except Exception as e:
    print(f"❌ Failed to configure Gemini API: {str(e)}")

# -----------------------------
# Health check endpoint
# -----------------------------
@app.route('/health', methods=['GET'])
@limiter.limit("10 per minute")
def health_check():
    try:
        return jsonify({
            'status': 'Gemini Career Guidance AI running',
            'timestamp': datetime.now().isoformat(),
            'version': '1.0.0'
        }), 200
    except Exception as e:
        print(f"❌ Health check error: {str(e)}")
        return jsonify({'error': f'Health check failed: {str(e)}'}), 500

# -----------------------------
# Career Guidance Logic
# -----------------------------
def generate_career_guidance(user_message=None, assessment_data=None, user_id=None):
    """
    Generates a career guidance report or chat response using Gemini AI
    """
    cache_key = f"{user_id}:{user_message or str(assessment_data)}"
    if cache_key in cache:
        print(f"Cache hit for {cache_key}")
        return cache[cache_key]

    try:
        # Build prompt content
        if user_message:
            content = f"""
User career query: {user_message}
Provide a supportive career guidance response with:
1. Possible career paths or roles relevant to the user's interest/skills.
2. Recommended skills, certifications, or tools to learn.
3. A step-by-step roadmap (short-term, mid-term, long-term).
4. Motivational advice to keep them encouraged.
5. Disclaimer that this is general guidance and they should also explore professional career counseling.
"""
        elif assessment_data:
            content = f"""
Analyze career potential based on the following assessment data: {assessment_data}
Provide a detailed report with:
1. Suitable career domains/industries.
2. Key strengths and areas of improvement.
3. Personalized skill development roadmap (short-term, mid-term, long-term).
4. Suggested projects, internships, or certifications.
5. Disclaimer that this is general guidance and they should also explore professional career counseling.
"""
        else:
            content = """
Generate a general career guidance report with:
1. Popular career paths in tech and non-tech.
2. Recommended foundational skills.
3. A generic learning roadmap.
4. Motivational advice for beginners.
5. Disclaimer that this is general guidance and they should also explore professional career counseling.
"""

        model = genai.GenerativeModel("gemini-1.5-flash")
        max_retries = 3
        retry_delay = 5  # seconds

        for attempt in range(max_retries):
            try:
                response = model.generate(content=content)
                result = response.text
                cache[cache_key] = result
                print(f"Gemini response: {result[:100]}...")
                return result
            except google.api_core.exceptions.ResourceExhausted as e:
                if attempt < max_retries - 1:
                    print(f"⚠️ Rate limit hit, retrying in {retry_delay}s...")
                    sleep(retry_delay)
                    retry_delay *= 2
                else:
                    print(f"❌ Max retries reached: {str(e)}")
                    raise

    except Exception as e:
        print(f"⚠️ Gemini error: {str(e)}")
        traceback.print_exc()
        fallback_text = (
            "🧑‍💼 FALLBACK CAREER GUIDANCE REPORT\n"
            "⚠️ Cannot fetch detailed guidance due to API limitations.\n"
            "💡 General advice:\n"
            "• Explore online learning platforms like Coursera, Udemy, or LinkedIn Learning.\n"
            "• Build personal projects to strengthen your portfolio.\n"
            "• Network with professionals in your field of interest.\n"
            "• Take online assessments to identify strengths and interests.\n"
            "⚠️ Disclaimer: This is general guidance. For personalized advice, consult a career counselor."
        )
        cache[cache_key] = fallback_text
        return fallback_text

# -----------------------------
# Generate Career Guidance Report
# -----------------------------
@app.route('/api/ai-report', methods=['GET'])
@limiter.limit("10 per minute")
def generate_report():
    try:
        user_id = request.args.get('userId', '').strip()
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        # Fetch assessment data from backend
        assessment_response = requests.get(
            f"{os.getenv('BACKEND_URL', 'http://localhost:3000')}/api/usermentalhealth/status",
            params={'userId': user_id},
            cookies=request.cookies
        )

        if assessment_response.status_code != 200:
            return jsonify({
                'analysis': f"Failed to fetch assessment data: Status {assessment_response.status_code}",
                'type': 'error',
                'confidence': '0%',
                'source': 'Error',
                'timestamp': datetime.now().isoformat(),
            }), 500

        assessment_data = assessment_response.json().get('mentalHealthAnswers', {})
        result = generate_career_guidance(assessment_data=assessment_data, user_id=user_id)

        response_data = {
            'analysis': result,
            'type': 'fallback' if 'FALLBACK' in result else 'gemini_career_guidance',
            'confidence': '50%' if 'FALLBACK' in result else '85%',
            'source': 'Fallback' if 'FALLBACK' in result else 'Gemini LLM',
            'timestamp': datetime.now().isoformat(),
        }

        return jsonify(response_data), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'analysis': f"Failed to generate report: {str(e)}",
            'type': 'error',
            'confidence': '0%',
            'source': 'Error',
            'timestamp': datetime.now().isoformat(),
        }), 500

# -----------------------------
# Chat Endpoint
# -----------------------------
@app.route('/api/ai-chat', methods=['POST'])
@limiter.limit("10 per minute")
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        user_id = data.get('userId', '').strip()

        if not user_message:
            return jsonify({'error': 'Message required'}), 400

        result = generate_career_guidance(user_message=user_message, user_id=user_id)

        response_data = {
            'response': result,
            'type': 'fallback' if 'FALLBACK' in result else 'gemini_career_guidance',
            'confidence': '50%' if 'FALLBACK' in result else '85%',
            'source': 'Fallback' if 'FALLBACK' in result else 'Gemini LLM',
            'timestamp': datetime.now().isoformat(),
        }

        return jsonify(response_data), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'response': f"Failed to get response: {str(e)}",
            'type': 'error',
            'confidence': '0%',
            'source': 'Error',
            'timestamp': datetime.now().isoformat(),
        }), 500

# -----------------------------
# Analyses History Endpoint (Mock)
# -----------------------------
@app.route('/api/analyses', methods=['GET'])
@limiter.limit("10 per minute")
def get_analyses():
    try:
        user_id = request.args.get('userId', '').strip()
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        # Mock history (replace with DB storage if needed)
        history = [
            {
                'userInput': {'text': 'I am interested in AI and ML'},
                'aiResponse': {
                    'response': 'Recommended path: Data Scientist or ML Engineer. Build Python skills, practice projects, and take online ML courses.',
                    'type': 'gemini_career_guidance',
                    'confidence': '85%',
                    'source': 'Gemini LLM',
                    'timestamp': datetime.now().isoformat(),
                },
                'timestamp': datetime.now().isoformat(),
            }
        ]

        return jsonify({'success': True, 'data': history}), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': f'Failed to fetch analyses: {str(e)}'}), 500

# -----------------------------
# Run App
# -----------------------------
if __name__ == '__main__':
    print("🚀 Starting Gemini Career Guidance AI on port 5002...")
    app.run(host='0.0.0.0', port=5002, debug=True)
