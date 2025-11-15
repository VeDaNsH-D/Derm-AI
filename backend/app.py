# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import os
from dotenv import load_dotenv
import traceback
import io

# --- INIT ---
app = Flask(__name__)
CORS(app)
load_dotenv()

# --- CONFIG ---
# 1. Get the key
gemini_api_key = os.environ.get("GEMINI_API_KEY")

# 2. Configure Gemini
try:
    if gemini_api_key:
        genai.configure(api_key=gemini_api_key)
    else:
        print("ERROR: GEMINI_API_KEY is missing from environment variables.")
except Exception as e:
    print(f"Configuration Error: {e}")

SYSTEM_PROMPT = """
You are DermAI-ssist. Analyze this skin lesion image.
1. Describe visible features (Asymmetry, Border, Color, Diameter).
2. Provide general educational info.
3. DO NOT diagnose.
4. ALWAYS recommend seeing a doctor.
"""

@app.route('/analyze', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    img_file = request.files['image']

    try:
        # Robust Image Loading: Read bytes into a buffer
        # This fixes issues where the file pointer gets lost
        img_bytes = img_file.read()
        img = Image.open(io.BytesIO(img_bytes))
    except Exception as e:
        return jsonify({'error': f'Image loading failed: {str(e)}'}), 400

    # USE THIS MODEL
    model_name = 'gemini-1.5-flash'
    
    try:
        model = genai.GenerativeModel(model_name)

        safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }

        response = model.generate_content(
            [SYSTEM_PROMPT, "\nUser Image:", img], 
            safety_settings=safety_settings
        )
        
        return jsonify({
            'analysis': response.text,
            'model': model_name
        })

    except Exception as e:
        # LOG THE REAL ERROR to the console
        print(f"CRITICAL AI ERROR: {e}")
        traceback.print_exc()
        
        # SEND THE REAL ERROR to the frontend so you can see it
        return jsonify({
            'error': f"AI Error ({model_name}): {str(e)}", 
            'details': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
