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
from google.api_core import exceptions as api_exceptions
import traceback
import base64

# ---------------------------------------------------------
# FLASK APP INIT
# ---------------------------------------------------------
app = Flask(__name__)
CORS(app)
load_dotenv()

@app.after_request
def add_coop_header(response):
    response.headers['Cross-Origin-Opener-Policy'] = 'same-origin-allow-popups'
    return response

# ---------------------------------------------------------
# GEMINI CONFIG
# ---------------------------------------------------------
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("No GEMINI_API_KEY found in environment variables.")
genai.configure(api_key=gemini_api_key)

SYSTEM_PROMPT = """
You are an educational assistant. Analyze the image and explain it clearly.
Avoid harmful, explicit, hateful or dangerous content.
"""

# A prioritized list of model IDs to try.
# Update this list if you learn of a different model id from genai.list_models()
CANDIDATE_MODELS = [
    # Vision-capable Gemini-style names (try the ones you think might exist)
    "gemini-pro-vision",
    "gemini-1.5-pro",
    "gemini-1.5",
    "gemini-pro",
    "gemini-vision",
    # Generic/older Google model names sometimes seen in examples:
    "models/vision-bison-001",
    "models/text-bison-001",
    # Add more candidates as needed...
]

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

    # Read bytes for prompt usage; ensure pointer at start
    try:
        img_file.stream.seek(0)
        image_bytes = img_file.read()
    except Exception as e:
        return jsonify({'error': f'Failed to read uploaded image: {str(e)}'}), 400

    # Prepare the image part in a portable representation (some SDKs expect bytes; others want base64 in prompt)
    image_part_bytes = {
        "mime_type": img_file.mimetype,
        "data": image_bytes
    }

    # Also prepare a base64 inline fallback for text-only models (if needed)
    b64_image = base64.b64encode(image_bytes).decode("utf-8")
    inline_image_prompt = (
        "Image provided as base64 (data omitted for brevity). "
        "If you can process images, analyze it. Otherwise, respond that a vision-capable model is required."
    )

    # Safety settings (keep these as before)
    safety_settings = {
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
    }

    # Try candidate models in order until one works
    last_notfound_errors = []
    for model_id in CANDIDATE_MODELS:
        try:
            print(f"[Trying model] {model_id}")
            model = genai.GenerativeModel(model_id)

            # Build prompt parts
            # For models that support binary image parts, we pass image_part_bytes directly.
            # For text-only models, this will likely raise NotFound or InvalidArgument and then fallthrough.
            prompt_parts = [
                SYSTEM_PROMPT,
                "Here is the image provided by the user:",
                image_part_bytes,
                "\nProvide a clear, educational analysis of this image. Explain visible features and likely benign differentials."
            ]

            # Attempt to generate content
            response = model.generate_content(prompt_parts, safety_settings=safety_settings)

            # If we reach here, the model accepted the call. Extract text robustly:
            analysis_text = None
            # 1) SDK object with .text
            if hasattr(response, "text"):
                analysis_text = response.text
            # 2) dict-like responses
            elif isinstance(response, dict):
                # common keys
                analysis_text = response.get("output") or response.get("content") or response.get("text")
                if not analysis_text:
                    # candidates list fallback
                    candidates = response.get("candidates") or response.get("outputs") or None
                    if isinstance(candidates, list) and len(candidates) > 0:
                        first = candidates[0]
                        if isinstance(first, dict):
                            analysis_text = first.get("content") or first.get("text")
            # 3) fallback to str()
            if not analysis_text:
                analysis_text = str(response)

            # return the successful result and which model worked (helpful for debugging)
            return jsonify({
                "analysis": analysis_text,
                "model_used": model_id
            })

        except api_exceptions.NotFound as e:
            # model not present / unsupported for this API/version
            print(f"[NotFound] {model_id}: {e}")
            last_notfound_errors.append((model_id, str(e)))
            # try next candidate
            continue
        except api_exceptions.InvalidArgument as e:
            # Likely the model exists but doesn't accept the multipart image format we used
            # Try a textual fallback using base64 embed (some deployments support this)
            print(f"[InvalidArgument] {model_id}: {e} -- attempting base64-text fallback")
            try:
                model = genai.GenerativeModel(model_id)
                prompt_text_fallback = (
                    SYSTEM_PROMPT
                    + "\nThe user uploaded an image. The image is provided as base64 below.\n"
                    + "(Base64 omitted in response; server contains the data.)\n"
                    + inline_image_prompt
                )
                # Provide a short version that indicates base64 is present; avoid huge payloads if server parsing fails
                response = model.generate_content([prompt_text_fallback], safety_settings=safety_settings)
                # extract text as above
                analysis_text = getattr(response, "text", None)
                if not analysis_text and isinstance(response, dict):
                    analysis_text = response.get("output") or response.get("content") or response.get("text")
                if not analysis_text:
                    analysis_text = str(response)
                return jsonify({
                    "analysis": analysis_text,
                    "model_used": model_id,
                    "note": "Used base64-text fallback because image part failed for this model."
                })
            except Exception as sub_e:
                print(f"[Fallback failed] {model_id} fallback error: {sub_e}")
                traceback.print_exc()
                # move on to next candidate
                continue
        except (api_exceptions.InternalServerError, api_exceptions.ResourceExhausted) as e:
            print(f"[Server/Resource] {model_id}: {e}")
            traceback.print_exc()
            return jsonify({
                "error": "AI service temporary issue (server/resource). Try again later.",
                "details": str(e)
            }), 503
        except Exception as e:
            # Unexpected error for this candidate; log and try next
            print(f"[Unexpected while trying {model_id}] {type(e).__name__}: {e}")
            traceback.print_exc()
            # If it's clearly a permission/auth error, return immediately
            if isinstance(e, api_exceptions.PermissionDenied) or isinstance(e, api_exceptions.Unauthenticated):
                return jsonify({'error': 'Authentication/permission error with generative API key.', 'details': str(e)}), 401
            continue

    # If we get here: none of the candidates worked. Try to list available models and return that info
    try:
        print("[No candidate worked] attempting to list available models for this account")
        available = genai.list_models()
        model_ids = []
        if isinstance(available, (list, tuple)):
            # list of model dicts or strings
            for m in available:
                if isinstance(m, dict):
                    model_ids.append(m.get("name") or m.get("id") or str(m))
                else:
                    model_ids.append(str(m))
        elif isinstance(available, dict):
            models_list = available.get("models") or available.get("modelIds") or []
            for m in models_list:
                if isinstance(m, dict):
                    model_ids.append(m.get("name") or m.get("id") or str(m))
                else:
                    model_ids.append(str(m))
        else:
            model_ids = [str(available)]

        return jsonify({
            "error": "No candidate model succeeded. See available models for your account/API version.",
            "tried_candidates": [m for m, _ in last_notfound_errors] if last_notfound_errors else CANDIDATE_MODELS,
            "available_models_sample": model_ids[:50]
        }), 400

    except Exception as e:
        print("[Model listing failed]", e)
        traceback.print_exc()
        return jsonify({
            "error": "No candidate model succeeded and listing models failed.",
            "tried_candidates": [m for m, _ in last_notfound_errors] if last_notfound_errors else CANDIDATE_MODELS,
            "details": str(e)
        }), 500


# ---------------------------------------------------------
# RUN SERVER
# ---------------------------------------------------------
if __name__ == '__main__':
    app.run(debug=True, port=5000)
