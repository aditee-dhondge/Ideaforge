# IdeaForge — Gemini API Edition

A student project-idea generator website built with React + Vite (frontend), Python Flask (backend), and Google's Gemini API (real AI generation).

## Requirements
- Python 3.10 or newer
- Node.js 18 or newer (Node.js 20 LTS recommended)
- A Gemini API key from https://aistudio.google.com/api-keys

## Important
Use this ZIP as the one complete project. Extract it and open the `IdeaForge-Gemini` folder in VS Code. Do not mix files with an older ZIP.

Never put your Gemini API key in React/frontend files or commit your `.env` file to GitHub. API access and free-tier limits depend on your Google AI Studio account and selected model.

## 1. Backend setup (Terminal 1)
Open a terminal in VS Code and run:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
cp .env.example .env
```

Open `backend/.env` and replace `PASTE_YOUR_GEMINI_API_KEY_HERE` with the key you created in Google AI Studio. Keep the rest of the file as-is. Save it.

Start Flask:

```bash
python app.py
```

Keep this terminal open. Backend health check: http://127.0.0.1:5000/api/health

Expected health response includes `"provider": "Google Gemini"` and `"api_key_configured": true`.

## 2. Frontend setup (Terminal 2)
Open a second terminal at the project root and run:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually http://localhost:5173/.

## 3. Test
Choose a domain, skill level, available time and optional interests, then click **Generate 5 project ideas**. The browser calls Flask at `http://127.0.0.1:5000/api/generate`; Flask calls Gemini using the key stored in `backend/.env`.

## Troubleshooting
- `api_key_configured: false`: check that `backend/.env` exists and the key is saved under `GEMINI_API_KEY`; restart Flask after editing `.env`.
- HTTP 401/403: create/check the key in Google AI Studio and ensure it is valid for Gemini API.
- HTTP 429: check Google AI Studio usage, quota, billing status and model-specific rate limits. Changing code or restarting cannot remove an account quota limit.
- HTTP 404/model not found: check that the model is available to your API project; set `GEMINI_MODEL` in `.env` to a currently available model.
- Port already in use: stop the old server with Ctrl+C before starting another one.

## Project structure

```text
IdeaForge-Gemini/
├── frontend/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
├── .gitignore
└── README.md
```
