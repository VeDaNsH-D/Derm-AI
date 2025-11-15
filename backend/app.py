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

# ---------------------------------------------------------
# FLASK APP INIT
# ---------------------------------------------------------
app = Flask(__name__)
CORS(app) 
load_dotenv()

# ---------------------------------------------------------
# GEMINI CONFIG
# ---------------------------------------------------------
# Replace with your API key
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("No GEMINI_API_KEY found in environment variables.")
genai.configure(api_key=gemini_api_key)

SYSTEM_PROMPT = """
You are an educational assistant. Analyze the image and explain it clearly.
Avoid harmful, explicit, hateful or dangerous content.
"""

# ---------------------------------------------------------
# IMAGE ANALYSIS ROUTE
# ---------------------------------------------------------
@app.route('/analyze', methods=['POST'])
def analyze_image():
    # Check for file
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    img_file = request.files['image']

    # Validate image using PIL
    try:
        img = Image.open(img_file.stream)
        img.verify()  
        img_file.stream.seek(0)  # reset pointer after PIL check
    except Exception as e:
        return jsonify({'error': f'Invalid image file: {str(e)}'}), 400

    # Process AI code
    try:
        # Gemini Vision Model
        model = genai.GenerativeModel('gemini-pro-vision')

        # Safety settings
        safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }

        # Convert uploaded image → bytes format required by Gemini
        image_bytes = img_file.read()
        image_part = {
            "mime_type": img_file.mimetype,
            "data": image_bytes
        }

        # Build prompt
        prompt_parts = [
            SYSTEM_PROMPT,
            "Here is the image provided by the user:",
            image_part,
            "\nProvide a clear, educational analysis of this image."
        ]

        # Generate response
        response = model.generate_content(prompt_parts, safety_settings=safety_settings)

        # Return analysis
        return jsonify({'analysis': response.text})

    except (genai.errors.InternalServerError, genai.errors.ResourceExhaustedError) as e:
        print(f"[Gemini Error] {type(e).__name__}: {e}")
        return jsonify({
            'error': 'The service is currently unavailable or overloaded. Please try again later.'
        }), 503
    except genai.errors.InvalidArgumentError as e:
        print(f"[Gemini Error] InvalidArgumentError: {e}")
        return jsonify({'error': 'Invalid request. Please check the image format and size.'}), 400
    except Exception as e:
        # Catch any other unexpected errors
        print(f"[Unexpected Error] {type(e).__name__}: {e}")
        return jsonify({'error': 'An unexpected error occurred. Please try again.'}), 500


# ---------------------------------------------------------
# RUN SERVER
# ---------------------------------------------------------
if __name__ == '__main__':
    app.run(debug=True, port=5000)
