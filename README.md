# TruthLayer AI – Automated Fact-Checking Web App

TruthLayer AI is a web-based fact-checking system that verifies claims inside uploaded PDF documents using live web search and AI reasoning.

The application extracts factual claims such as statistics, dates, financial figures, and technical statements from PDFs, searches the live web for supporting evidence, and classifies claims as:

* Verified
* Inaccurate
* False

## Features

* PDF Upload Interface
* Automated Claim Extraction
* Live Web Verification using Tavily
* AI Verification using Groq + Gemini
* Accuracy Dashboard
* Verification Status & Confidence Scores
* Modern React UI with FastAPI Backend

---

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS

### Backend

* FastAPI
* Python

### APIs & AI

* Tavily Search API
* Groq API
* Gemini API

---

## Project Structure

```bash
truthlayer-ai/
├── backend/
│   ├── services/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

---

## Backend Setup

```bash
cd backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

python -m uvicorn main:app --reload
```

Backend runs on:

```bash
http://127.0.0.1:8000
```

Swagger Docs:

```bash
http://127.0.0.1:8000/docs
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

## Environment Variables

Create a `.env` file inside `/backend`:

```env
GROQ_API_KEY=your_key
GEMINI_API_KEY=your_key
TAVILY_API_KEY=your_key
```

---

## Deployment

* Frontend: Vercel
* Backend: Render

---

## Known Limitations

* Personal/private claims cannot always be verified publicly.
* Verification speed depends on API response time.
* Some claims may lack enough public evidence.

---

## Demo

The system can detect intentionally false or outdated claims from uploaded “trap documents” and classify them automatically.
