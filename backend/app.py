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
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)

SYSTEM_PROMPT = """
You are DermAI-ssist. Analyze this skin lesion image.
1. Describe visible features (Asymmetry, Border, Color, Diameter).
2. Provide general educational info.
3. DO NOT diagnose.
4. ALWAYS recommend seeing a doctor.
"""

# LIST OF MODELS TO TRY (In order of preference)
MODEL_CANDIDATES = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro-vision',
    'gemini-1.5-flash-latest'
]

@app.route('/analyze', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    img_file = request.files['image']

    try:
        # Robust Image Loading
        img_bytes = img_file.read()
        img = Image.open(io.BytesIO(img_bytes))
    except Exception as e:
        return jsonify({'error': f'Image loading failed: {str(e)}'}), 400

    # Safety settings
    safety_settings = {
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
    }

    last_error = None

    # LOOP THROUGH MODELS until one works
    for model_name in MODEL_CANDIDATES:
        try:
            print(f"Attempting to use model: {model_name}...")
            model = genai.GenerativeModel(model_name)

            response = model.generate_content(
                [SYSTEM_PROMPT, "\nUser Image:", img], 
                safety_settings=safety_settings
            )
            
            # If we get here, it worked!
            return jsonify({
                'analysis': response.text,
                'model_used': model_name
            })

        except Exception as e:
            print(f"Failed with {model_name}: {e}")
            last_error = e
            # Continue to the next model in the list...
            continue

    # If we exit the loop, NOTHING worked
    traceback.print_exc()
    return jsonify({
        'error': 'All AI models failed.', 
        'details': str(last_error)
    }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
