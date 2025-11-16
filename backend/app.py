# backend/app.py

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from PIL import Image
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import os
import traceback
import io
from datetime import datetime
from bson import ObjectId
# ---------------------------------------------------------
# LOAD ENVIRONMENT VARIABLES
# ---------------------------------------------------------
load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route("/ping")
def ping():
    return "pong", 200


# ---------------------------------------------------------
# MONGO CONFIG
# ---------------------------------------------------------
mongo_uri = os.getenv("MONGO_URI")

if not mongo_uri:
    print("ERROR: MONGO_URI missing in .env file")
else:
    print("Loaded MONGO_URI:", mongo_uri)

app.config["MONGO_URI"] = mongo_uri

mongo = PyMongo(app)


mongo = PyMongo(app)


@app.route("/test-db")
def test_db():
    try:
        mongo.db.command("ping")
        return jsonify({"message": "MongoDB connected!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------
# GEMINI CONFIG
# ---------------------------------------------------------
gemini_api_key = os.getenv("GEMINI_API_KEY")

if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
else:
    print("WARNING: GEMINI_API_KEY missing in .env")

# ---------------------------------------------------------
# SYSTEM PROMPT (Shortened)
# ---------------------------------------------------------
SYSTEM_PROMPT = """
You are **DermAI**, an advanced dermatological diagnostic assistant.
Your task is to inspect the skin image and identify the underlying condition.
You will learn from these reference cases first.

[REFERENCE CASES - LEARN FROM THESE]
1. CASE: Melanoma
   - Visuals: Asymmetrical, irregular border, black/brown/red color mix, diameter 8mm.
   - Diagnosis: Melanoma (High Risk).
   - Advice: URGENT: Visit a Dermatologist immediately. Do not attempt home remedies.
2. CASE: Eczema
   - Visuals: Red, itchy patches, scaling, skin is dry and inflamed.
   - Diagnosis: Atopic Dermatitis (Low Risk).
   - Advice: Routine Care. Home Remedies: Apply a thick, unscented moisturizer (e.g., petroleum jelly) and avoid hot showers.
3. CASE: Acne
   - Visuals: Red pustules (pimples), blackheads, oily skin.
   - Diagnosis: Acne Vulgaris (Low Risk).
   - Advice: Routine Care. Home Remedies: Use a gentle cleanser with salicylic acid. Do not pick or pop the pimples.
[END REFERENCE CASES]

Now, analyze the USER IMAGE following these patterns.

**RESPONSE STRUCTURE:**

**1. Visual Analysis**
* Briefly list the key visual features detected (Color, Texture, Pattern, Location).

**2. Top Potential Conditions (What is this?)**
* Identify the **Top 3 most likely conditions** that visually match this image.
* For each condition, state:
    * **Name:** (e.g., Melanoma, Eczema, Tinea Corporis, Acne)
    * **Likelihood:** (High/Medium/Low)
    * **Reasoning:** Why does it look like this? (e.g., "The pearl-like border suggests Basal Cell Carcinoma")

**3. Management & Remedies**
* **CRITICAL LOGIC:**
    * **IF the condition is High Risk** (e.g., Melanoma, Carcinoma, serious infection):
        * **Action:** "**URGENT:** Visit a Dermatologist immediately."
        * **Home Advice:** "Do not attempt home remedies. Avoid touching or irritating the area."
    * **IF the condition is Benign/Low Risk** (e.g., Acne, Dry Skin, Heat Rash):
        * **Action:** "**Routine Care:** Monitor the area."
        * **Home Remedies:** List 2-3 effective home treatments (e.g., "Apply aloe vera," "Use salicylic acid cleanser," "Keep area dry").

**DISCLAIMER:**
* End with: "Note: This analysis is AI-generated and is not a substitute for a doctor's diagnosis."
"""
MODEL_CANDIDATES = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp"
]

# ---------------------------------------------------------
# SAVE ANALYSIS
# ---------------------------------------------------------


@app.route("/save-analysis", methods=["POST"])
def save_analysis():
    try:
        data = request.get_json(force=True)

        if not data:
            return jsonify({"error": "No JSON received"}), 400

        mongo.db.analysis.insert_one({
            "user_email": data.get("email"),
            "title": data.get("title"),
            "analysis": data.get("analysis"),
            "created_at": datetime.utcnow()
        })

        return jsonify({"message": "saved"}), 200

    except Exception as e:
        print("Error saving analysis:", e)
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------
# GET HISTORY
# ---------------------------------------------------------
@app.route("/history", methods=["GET"])
def get_history():
    try:
        email = request.args.get("email")
        if not email:
            return jsonify({"error": "Missing email parameter"}), 400

        items = list(mongo.db.analysis.find({"user_email": email}))

        for item in items:
            item["_id"] = str(item["_id"])
            item["created_at"] = item["created_at"].strftime("%Y-%m-%d %H:%M")

        return jsonify(items), 200

    except Exception as e:
        print("Error fetching history:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/history-item", methods=["GET"])
def get_history_item():
    try:
        item_id = request.args.get("id")
        item = mongo.db.analysis.find_one({"_id": ObjectId(item_id)})

        if not item:
            return jsonify({"error": "Item not found"}), 404

        item["_id"] = str(item["_id"])
        item["created_at"] = item["created_at"].strftime("%Y-%m-%d %H:%M")

        return jsonify(item), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/delete-analysis", methods=["DELETE"])
def delete_analysis():
    try:
        item_id = request.args.get("id")
        result = mongo.db.analysis.delete_one({"_id": ObjectId(item_id)})

        if result.deleted_count == 0:
            return jsonify({"error": "Item not found"}), 404

        return jsonify({"message": "deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------
# ANALYZE IMAGE
# ---------------------------------------------------------
@app.route("/analyze", methods=["POST"])
def analyze_image():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        img_file = request.files["image"]

        img_bytes = img_file.read()
        img = Image.open(io.BytesIO(img_bytes))

        safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }

        last_error = None

        for model_name in MODEL_CANDIDATES:
            try:
                print(f" Trying model: {model_name}")
                model = genai.GenerativeModel(model_name)

                response = model.generate_content(
                    [SYSTEM_PROMPT, "\nUser Image:", img],
                    safety_settings=safety_settings
                )

                return jsonify({
                    "analysis": response.text,
                    "model_used": model_name
                }), 200

            except Exception as e:
                print(f" Failed with {model_name}: {e}")
                last_error = e
                continue

        return jsonify({"error": "All models failed", "details": str(last_error)}), 500

    except Exception as e:
        print("Fatal error in analyze:", e)
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------
# RUN SERVER
# ---------------------------------------------------------
if __name__ == "__main__":
    print("Flask app starting...")
    app.run(debug=True, port=5000)
