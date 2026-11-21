import json
import logging
import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from google import genai
from google.genai import errors, types

# Load backend/.env regardless of the directory used to start Flask.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
        }
    },
)

logging.basicConfig(level=logging.INFO)
MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")

PROJECT_SCHEMA = {
    "type": "object",
    "properties": {
        "ideas": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "problem_statement": {"type": "string"},
                    "difficulty": {
                        "type": "string",
                        "enum": ["Beginner", "Intermediate", "Advanced"],
                    },
                    "estimated_duration": {"type": "string"},
                    "technologies": {"type": "array", "items": {"type": "string"}},
                    "modules": {"type": "array", "items": {"type": "string"}},
                    "key_features": {"type": "array", "items": {"type": "string"}},
                },
                "required": [
                    "title",
                    "description",
                    "problem_statement",
                    "difficulty",
                    "estimated_duration",
                    "technologies",
                    "modules",
                    "key_features",
                ],
                "additionalProperties": False,
            },
        }
    },
    "required": ["ideas"],
    "additionalProperties": False,
}


def validate_input(data):
    domain = str(data.get("domain", "")).strip()
    skill_level = str(data.get("skillLevel", "")).strip()
    available_time = str(data.get("availableTime", "")).strip()
    interests = str(data.get("interests", "")).strip()

    if not domain or not skill_level or not available_time:
        return None, "Please provide a domain, skill level, and available time."
    if len(domain) > 80 or len(interests) > 500:
        return None, "Please keep the domain and interests within the allowed length."
    if skill_level not in {"Beginner", "Intermediate", "Advanced"}:
        return None, "Please choose a valid skill level."
    if available_time not in {"1 week", "2 weeks", "1 month", "2 months", "3 months", "6 months"}:
        return None, "Please choose a valid time period."

    return {
        "domain": domain,
        "skill_level": skill_level,
        "available_time": available_time,
        "interests": interests or "Not specified",
    }, None


@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "message": "IdeaForge Flask API is running.",
        "provider": "Google Gemini",
        "model": MODEL,
        "api_key_configured": bool(os.getenv("GEMINI_API_KEY")),
    })


@app.post("/api/generate")
def generate_ideas():
    data = request.get_json(silent=True) or {}
    preferences, error = validate_input(data)
    if error:
        return jsonify({"error": error}), 400

    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key or api_key == "your_gemini_api_key_here":
        return jsonify({
            "error": "GEMINI_API_KEY is missing. Add your Google Gemini API key to backend/.env and restart Flask."
        }), 503

    prompt = f"""Create exactly five practical and distinct student software project ideas.

Student preferences:
- Domain: {preferences['domain']}
- Skill level: {preferences['skill_level']}
- Available development time: {preferences['available_time']}
- Interests or preferred technologies: {preferences['interests']}

Requirements:
1. Match the complexity to the student's skill level and available time.
2. Make all five ideas meaningfully different and feasible for a student.
3. Include realistic technologies, 3-5 implementation modules, and 3-5 key features per idea.
4. Estimate a realistic duration that fits the student's available time.
5. Use clear, student-friendly language.
6. Return exactly five ideas following the supplied JSON schema."""

    client = None
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=(
                    "You are an experienced academic project mentor. "
                    "Suggest original, realistic, buildable student software projects. "
                    "Follow the JSON response schema exactly."
                ),
                response_mime_type="application/json",
                response_json_schema=PROJECT_SCHEMA,
                temperature=0.7,
                max_output_tokens=7000,
            ),
        )

        if not response.text:
            app.logger.error("Gemini returned an empty response. Feedback: %s", getattr(response, "prompt_feedback", None))
            return jsonify({"error": "Gemini returned an empty response. Please try again with different preferences."}), 502

        result = json.loads(response.text)
        ideas = result.get("ideas", [])
        if len(ideas) != 5:
            app.logger.error("Gemini returned %s ideas instead of five", len(ideas))
            return jsonify({"error": "The AI did not return five ideas. Please try again."}), 502

        return jsonify({"ideas": ideas, "provider": "Google Gemini", "model": MODEL})

    except errors.APIError as exc:
        status_code = getattr(exc, "code", None)
        message = str(getattr(exc, "message", "") or exc)
        app.logger.exception("Gemini API error (HTTP %s): %s", status_code, message)

        lowered = message.lower()
        if status_code in (401, 403):
            return jsonify({"error": "Gemini rejected the API key or the key does not have permission. Check GEMINI_API_KEY in backend/.env."}), 401
        if status_code == 429:
            return jsonify({"error": "Gemini API quota or rate limit reached. Check your Google AI Studio usage and model limits, then try again later."}), 429
        if status_code == 404:
            return jsonify({"error": f"The Gemini model '{MODEL}' was not found or is unavailable to this API project. Check GEMINI_MODEL in backend/.env."}), 502
        if "api key" in lowered or "api_key" in lowered:
            return jsonify({"error": "Gemini API key authentication failed. Create a new key in Google AI Studio and update backend/.env."}), 401
        return jsonify({"error": "Gemini returned an API error. Check the Flask terminal for its HTTP status and details."}), 502

    except (json.JSONDecodeError, KeyError, TypeError, AttributeError):
        app.logger.exception("Could not parse Gemini response")
        return jsonify({"error": "Gemini returned an unreadable response. Please try again."}), 502
    except Exception:
        app.logger.exception("Unexpected error while generating project ideas")
        return jsonify({"error": "Something went wrong while contacting Gemini. Check the Flask terminal for details."}), 500
    finally:
        if client is not None:
            client.close()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
