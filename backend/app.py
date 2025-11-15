# backend/app.py
# ---------------------------------------------------------
# IMPORTS
# ---------------------------------------------------------
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import os
from dotenv import load_dotenv
import traceback

# ---------------------------------------------------------
# FLASK APP INIT
# ---------------------------------------------------------
app = Flask(__name__)
CORS(app)
load_dotenv()

# ---------------------------------------------------------
# GEMINI CONFIG
# ---------------------------------------------------------
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if not gemini_api_key:
    # Fallback for local testing if .env isn't loaded correctly
    print("Warning: GEMINI_API_KEY not found in environment variables.")

try:
    genai.configure(api_key=gemini_api_key)
except Exception as e:
    print(f"Error configuring Gemini: {e}")

SYSTEM_PROMPT = """
You are DermAI-ssist, a helpful AI assistant for skin health education.
Your purpose is to analyze an image of a skin lesion and provide educational, general information based on well-known dermatological principles (like the ABCDEs of melanoma).

**CRITICAL SAFETY RULES:**
1.  **DO NOT** provide a diagnosis.
2.  **DO NOT** provide any probability or likelihood of a condition.
3.  **DO NOT** give medical advice or suggest treatments.
4.  **DO** analyze the image based on visible features (Asymmetry, Border, Color, Diameter).
5.  **ALWAYS** conclude by strongly advising the user to consult a qualified healthcare professional.
"""

# ---------------------------------------------------------
# IMAGE ANALYSIS ROUTE
# ---------------------------------------------------------
@app.route('/analyze', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    img_file = request.files['image']

    try:
        # Validate image using PIL
        img = Image.open(img_file.stream)
    except Exception as e:
        return jsonify({'error': f'Invalid image file: {str(e)}'}), 400

    # --- MODEL SELECTION ---
    # 'gemini-1.5-flash' is the current best standard for multimodal (text + image)
    # It is faster and more reliable than the older 'gemini-pro-vision'
    model_name = 'gemini-1.5-flash' 
    
    try:
        model = genai.GenerativeModel(model_name)

        # Safety settings (Lenient for medical context to avoid false positives)
        safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }

        # Construct the prompt parts
        prompt_parts = [
            SYSTEM_PROMPT,
            "\nHere is the image provided by the user:",
            img, # Pass the PIL image object directly
            "\nProvide your educational analysis based on this image, following all safety rules."
        ]

        # Generate content
        response = model.generate_content(prompt_parts, safety_settings=safety_settings)
        
        return jsonify({
            'analysis': response.text,
            'model_used': model_name
        })

    except Exception as e:
        print(f"Error during generation with {model_name}: {e}")
        traceback.print_exc()
        
        # Fallback error handling
        return jsonify({
            'error': 'Failed to analyze image. The API might be busy or the image format unsupported.',
            'details': str(e)
        }), 500

# ---------------------------------------------------------
# RUN SERVER
# ---------------------------------------------------------
if __name__ == '__main__':
    app.run(debug=True, port=5000)
