# UPSA SOGS AI Agent - Kojo

This is an AI Call & Chat Agent for the University of Professional Studies, Accra (UPSA) School of Graduate Studies (SOGS).

## Features

- **Conversational Agent**: Handles enquiries about programmes, admissions, fees, and deadlines.
- **Voice & Chat**: Supports text-based chat, Voice-to-Text input, and Twilio Voice integration.
- **CRM Integration**: Auto-detects lead details (Programme Interest, Degree Level, etc.) and stores them in a Neon Postgres database.
- **LLM Powered**: Uses OpenAI GPT-4o (or Anthropic Claude).

## Tech Stack

- **Backend**: Python, FastAPI
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn UI
- **Database**: Neon (Serverless PostgreSQL) + SQLAlchemy (Async)
- **LLM**: OpenAI
- **Telephony**: Twilio (TwiML & Webhooks)

## Local Setup

1.  **Install Backend Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Install Frontend Dependencies**:
    ```bash
    cd frontend
    npm install
    npm run build
    cd ..
    ```

3.  **Environment Variables**:
    Copy `.env.example` to `.env` and fill in your keys.
    - `DATABASE_URL`: Your Neon Postgres connection string.
    - `OPENAI_API_KEY`: Your OpenAI key.

4.  **Run the Agent**:
    ```bash
    python run.py
    ```
    Access the Chat UI at `http://localhost:8000`.

## Deployment to Vercel

This application is configured as a **monorepo** where Vercel serves the React frontend statically and hosts the FastAPI backend as Serverless Functions.

### Framework Preset
When importing the repository in Vercel, use the **Vite** framework preset. Vercel will automatically detect the `frontend/` folder for the build, but you need to override the commands to ensure both frontend and backend work together.

### Vercel Project Settings
In your Vercel project settings, configure the following:

1. **Build & Development Settings**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install`

2. **Environment Variables**:
   Add the following variables to your Vercel project:
   - `OPENAI_API_KEY`
   - `DATABASE_URL`

### How it works on Vercel
- The `vercel.json` file routes all API traffic (`/chat`, `/voice/*`) to `api/index.py`.
- `api/index.py` exposes the FastAPI app to Vercel's Python runtime.
- The `frontend/dist` folder is served as the static frontend.

## Twilio Voice Setup

To enable voice calls:
1. Deploy this app to Vercel.
2. Go to your Twilio Console.
3. Configure your Twilio Phone Number's **Voice Webhook** to point to your Vercel deployment:
   `https://your-vercel-app-url.vercel.app/voice/incoming` (HTTP POST)
