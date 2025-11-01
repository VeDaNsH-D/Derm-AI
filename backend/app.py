import os
import io
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from PIL import Image
from google.generativeai.types import HarmCategory, HarmBlockThreshold

# Load environment variables
load_dotenv()

# --- Configuration ---
app = Flask(__name__)
# Allow requests from all origins
CORS(app)

# Configure the Gemini API key
try:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
except KeyError:
    raise RuntimeError("GEMINI_API_KEY not found. Please set it in .env")

# --- System Prompt (The "Safety Guardrails") ---
SYSTEM_PROMPT = """
You are DermAI-ssist, a helpful AI assistant for skin health education.
Your purpose is to analyze an image of a skin lesion and provide educational, general information based on well-known dermatological principles (like the ABCDEs of melanoma).

**CRITICAL SAFETY RULES:**
1.  **DO NOT** provide a diagnosis.
2.  **DO NOT** provide any probability or likelihood of a condition (e.g., "this is 80% likely to be...").
3.  **DO NOT** give medical advice or suggest treatments.
4.  **DO** analyze the image based on visible features (Asymmetry, Border, Color, Diameter).
5.  **DO** explain what these features mean in a general, educational context.
6.  **ALWAYS** conclude your analysis by strongly advising the user to consult a qualified healthcare professional or dermatologist for a proper diagnosis and advice. Your main goal is to encourage this professional consultation.

**Response Format:**
Start with a brief analysis of the visible features, then provide an educational summary, and end with the recommendation to see a doctor.
"""

# --- API Route ---
@app.route('/analyze', methods=['POST'])
def analyze_image():
    # --- THIS IS ALL INSIDE THE FUNCTION ---
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    img_file = request.files['image']

    try:
        # Load image using PIL
        img = Image.open(img_file.stream)
    except Exception as e:
        return jsonify({'error': f'Invalid image file: {str(e)}'}), 400

    # Initialize the Gemini Model
    model = genai.GenerativeModel('gemini-pro-vision')

    # Define safety settings to be more lenient for medical images
    safety_settings = {
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
    }

    # This is the prompt we send to the model
    prompt_parts = [
        SYSTEM_PROMPT,
        "Here is the image provided by the user:",
        img,
        "\nProvide your educational analysis based on this image, following all safety rules."
    ]

    try:
        # Generate the content
        response = model.generate_content(prompt_parts, safety_settings=safety_settings)
        
        # Return the AI's text response
        return jsonify({'analysis': response.text})
    except Exception as e:
        # Handle potential API errors (e.g., safety blocks, connection issues)
        print(f"Error generating content: {e}")
        return jsonify({'error': 'Failed to analyze image. The content may be unsafe or an API error occurred.'}), 500
    # --- END OF FUNCTION CODE ---

# --- Run the App ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)
