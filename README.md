# DermAI

DermAI is an AI-powered dermatological diagnostic assistant. It uses a powerful generative AI model to analyze images of skin conditions and provide a list of potential diagnoses, along with recommended actions and remedies.

## Features

*   **AI-Powered Analysis:** Leverages Google's Gemini model to provide a detailed analysis of skin condition images.
*   **Top Condition Identification:** Identifies the top 3 most likely skin conditions based on the visual evidence.
*   **Actionable Recommendations:** Provides clear next steps, distinguishing between high-risk conditions requiring immediate medical attention and low-risk conditions that can be managed with home remedies.
*   **Simple User Interface:** An easy-to-use, web-based interface for uploading images and viewing the analysis.

## Tech Stack

*   **Frontend:** React, Vite, Tailwind CSS
*   **Backend:** Flask, Python, Google Gemini, MongoDB

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js and npm (or yarn)
*   Python 3.x and pip
*   A MongoDB Atlas account or a local MongoDB instance
*   A Google AI API key for Gemini

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3.  **Install the required packages:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up your environment variables (see below).**

5.  **Run the Flask application:**
    ```bash
    flask run
    ```
    The backend will be running at `http://127.0.0.1:5000`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install the required packages:**
    ```bash
    npm install
    ```

3.  **Run the Vite development server:**
    ```bash
    npm run dev
    ```
    The frontend will be running at `http://localhost:5173`.

### Environment Variables

You will need to set the following environment variables in your backend directory. You can create a `.env` file for this purpose:

*   `MONGO_URI`: Your MongoDB connection string.
*   `GEMINI_API_KEY`: Your Google AI API key.

## Usage

1.  Open the application in your web browser.
2.  You will be prompted to upload an image of a skin condition.
3.  Select an image file from your local machine.
4.  The application will send the image to the backend for analysis.
5.  The AI-generated analysis will be displayed on the screen, showing the top potential conditions and recommended next steps.

## Disclaimer

**This analysis is AI-generated and is not a substitute for a doctor's diagnosis.**

The information provided by DermAI is for informational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this platform.
