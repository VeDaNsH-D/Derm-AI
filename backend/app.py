# ---------------------------------------------------------
# IMPORTS
# ---------------------------------------------------------
from flask import Flask, request, jsonify
from PIL import Image
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

# ---------------------------------------------------------
# FLASK APP INIT
# ---------------------------------------------------------
app = Flask(__name__)

# ---------------------------------------------------------
# GEMINI CONFIG
# ---------------------------------------------------------
# Replace with your API key
genai.configure(api_key="YOUR_API_KEY_HERE")

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

    except Exception as e:
        print(f"[Gemini Error] {e}")
        return jsonify({'error': 'Failed to analyze image. Possibly unsafe content or API error.'}), 500


# ---------------------------------------------------------
# RUN SERVER
# ---------------------------------------------------------
if __name__ == '__main__':
    app.run(debug=True, port=5000)
