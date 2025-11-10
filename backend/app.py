# --- API Route ---
@app.route('/analyze', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    img_file = request.files['image']

    try:
        # Load image using PIL
        img = Image.open(img_file.stream)
    except Exception as e:
        return jsonify({'error': f'Invalid image file: {str(e)}'}), 400

    # --- THIS IS THE FIX ---
    # All AI-related code is now inside the try block
    try:
        # Initialize the Gemini Model
        model = genai.GenerativeModel('gemini-pro-vision')

        # Define safety settings
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
        
        # Generate the content
        response = model.generate_content(prompt_parts, safety_settings=safety_settings)
        
        # Return the AI's text response
        return jsonify({'analysis': response.text})

    except Exception as e:
        # Handle all potential API errors (e.g., bad key, safety blocks)
        print(f"Error generating content: {e}")
        return jsonify({'error': 'Failed to analyze image. The content may be unsafe or an API error occurred.'}), 500
<<<<<<< HEAD

# --- Run the App ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)
=======
>>>>>>> refs/remotes/origin/main
