# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Derm-AI is a medical education application that uses Google's Gemini AI to analyze skin lesion images. The app consists of:
- **Backend**: Flask API that integrates with Google Gemini Vision API
- **Frontend**: React + Vite SPA that provides image upload and analysis display

**Critical Safety Design**: The backend implements strict safety guardrails to ensure the AI provides only educational information, never diagnoses, probabilities, or medical advice.

## Architecture

### Backend (`/backend`)
- **Framework**: Flask with CORS enabled
- **AI Model**: Google Gemini Pro Vision (`gemini-pro-vision`)
- **Entry Point**: `app.py` - Single-file Flask application
- **System Prompt**: Hardcoded in `SYSTEM_PROMPT` constant with safety rules that prevent medical diagnoses
- **API Endpoint**: `/analyze` (POST) - Accepts multipart image upload, returns JSON with analysis text
- **Port**: 5000

### Frontend (`/frontend`)
- **Framework**: React 19 with Vite
- **Build Tool**: Vite 7 with Fast Refresh
- **Components**: Single-page app in `App.jsx`
- **API Client**: axios (imported but missing from package.json dependencies)
- **Backend Connection**: Hardcoded to `http://127.0.0.1:5000/analyze`
- **Port**: Default Vite dev server (typically 5173)

## Development Commands

### Backend Setup & Run
```bash
cd backend
pip install -r requirements.txt
# Set GEMINI_API_KEY in .env file
python app.py
```
Backend runs on http://localhost:5000 in debug mode.

### Frontend Setup & Run
```bash
cd frontend
npm install
# NOTE: axios must be manually added: npm install axios
npm run dev
```
Frontend dev server runs on http://localhost:5173 (or next available port).

### Frontend Build & Preview
```bash
cd frontend
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

### Linting
```bash
cd frontend
npm run lint     # Run ESLint on all files
```

## Environment Configuration

### Required Environment Variables
- `backend/.env`: Must contain `GEMINI_API_KEY` with valid Google Gemini API key
- The backend will raise `RuntimeError` if this key is missing

### CORS Configuration
Backend allows requests from `http://localhost:3000` (hardcoded in app.py line 15). If frontend runs on different port, update CORS origins.

## Key Implementation Details

### AI Safety Guardrails
The `SYSTEM_PROMPT` in `backend/app.py` (lines 26-40) is the critical safety mechanism. When modifying AI behavior:
- Never remove safety rules that prevent diagnoses or probability statements
- Always maintain the requirement to advise users to consult healthcare professionals
- The prompt instructs analysis based on ABCDE criteria (Asymmetry, Border, Color, Diameter)

### Image Processing Flow
1. Frontend: User uploads image → FormData → axios POST to backend
2. Backend: Receives image → PIL Image.open() → Passes to Gemini with prompt
3. Gemini: Returns text analysis following system prompt rules
4. Backend: Returns `{analysis: text}` or `{error: message}`
5. Frontend: Displays result or error

### Error Handling
- Backend returns 400 for missing/invalid images
- Backend returns 500 for Gemini API errors (safety blocks, connection issues)
- Frontend displays errors in `.error-box` component

## Known Issues

### Missing Dependency
`axios` is imported in `frontend/src/App.jsx` but not listed in `package.json` dependencies. Install manually with:
```bash
cd frontend && npm install axios
```

### Syntax Error in Backend
`backend/app.py` line 81 has trailing 'c' character after closing parenthesis - should be removed.

## Tech Stack Reference

- **Backend**: Python 3.x, Flask, google-generativeai, Pillow, python-dotenv
- **Frontend**: React 19, Vite 7, ESLint 9, axios (unlisted)
- **API**: Google Gemini API (requires API key)
