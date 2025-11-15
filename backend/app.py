# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo  # <-- NEW IMPORT
from PIL import Image
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import os
# from dotenv import load_dotenv # You can remove this if you aren't using .env at all
import traceback
import io

# --- INIT ---
app = Flask(__name__)
CORS(app)
# load_dotenv() # Optional: Only needed if you use .env locally

# --- MONGODB CONFIGURATION ---
# The app looks for 'MONGO_URI' in the environment (Render handles this)
mongo_uri = os.environ.get("MONGO_URI")

if not mongo_uri:
    print("WARNING: MONGO_URI not found in environment variables.")
else:
    app.config["MONGO_URI"] = mongo_uri

# Initialize PyMongo
try:
    mongo = PyMongo(app)
except Exception as e:
    print(f"Error initializing MongoDB: {e}")

# --- GEMINI CONFIGURATION ---
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)

You are **DermAI**, an advanced dermatological diagnostic assistant.
Your task is to inspect the skin image and identify the underlying condition.
You will learn from these reference cases first.

SYSTEM_PROMPT = """
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
        * **Action:** " **URGENT:** Visit a Dermatologist immediately."
        * **Home Advice:** "Do not attempt home remedies. Avoid touching or irritating the area."
    * **IF the condition is Benign/Low Risk** (e.g., Acne, Dry Skin, Heat Rash):
        * **Action:** " **Routine Care:** Monitor the area."
        * **Home Remedies:** List 2-3 effective home treatments (e.g., "Apply aloe vera," "Use salicylic acid cleanser," "Keep area dry").

**DISCLAIMER:**
* End with: "Note: This analysis is AI-generated and is not a substitute for a doctor's diagnosis."
"""

MODEL_CANDIDATES = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp'
]

# --- ROUTES ---

# 1. NEW: Test DB Route
@app.route('/test-db', methods=['GET'])
def test_db():
    """Checks if the database connection is active."""
    try:
        # Try a simple command to ping the database
        # Use mongo.cx to access the client directly if needed, or mongo.db for the database
        if not mongo_uri:
             return jsonify({"error": "MONGO_URI variable is missing"}), 500
        
        # Ping command
        mongo.db.command('ping')
        return jsonify({"message": "MongoDB connection successful!", "status": "Connected"}), 200
    except Exception as e:
        return jsonify({"error": str(e), "status": "Failed"}), 500

# 2. Analyze Route
@app.route('/analyze', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    img_file = request.files['image']

    try:
        # Load image
        img_bytes = img_file.read()
        img = Image.open(io.BytesIO(img_bytes))
    except Exception as e:
        return jsonify({'error': f'Image loading failed: {str(e)}'}), 400

    safety_settings = {
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
    }

    last_error = None

    # Loop through models (Fallback Strategy)
    for model_name in MODEL_CANDIDATES:
        try:
            print(f"Attempting to use model: {model_name}...")
            model = genai.GenerativeModel(model_name)

            response = model.generate_content(
                [SYSTEM_PROMPT, "\nUser Image:", img], 
                safety_settings=safety_settings
            )
            
            # --- OPTIONAL: Log success to MongoDB ---
            # This saves a record that an analysis happened (without saving the image itself)
            try:
                if mongo.db:
                    mongo.db.analyses.insert_one({
                        "model_used": model_name,
                        "status": "success",
                        # We only save the first 100 chars to save space/privacy
                        "preview": response.text[:100] 
                    })
            except Exception as db_e:
                print(f"DB Logging failed (non-critical): {db_e}")
            # ----------------------------------------

            return jsonify({
                'analysis': response.text,
                'model_used': model_name
            })

        except Exception as e:
            print(f"Failed with {model_name}: {e}")
            last_error = e
            continue

    traceback.print_exc()
    return jsonify({
        'error': 'All AI models failed.', 
        'details': str(last_error)
    }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
