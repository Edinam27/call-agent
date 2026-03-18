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

## Deployment

### Option 1: Render (Recommended for Best Performance)

Render is highly recommended for this project because it runs a long-standing server, avoiding the database connection pooling limits and function timeouts associated with Vercel's serverless architecture. 

This project includes a `render.yaml` file for **1-click deployment**.

1. Push your code to GitHub.
2. Go to [Render](https://dashboard.render.com/) and click **New+** -> **Blueprint**.
3. Connect your GitHub repository. Render will automatically detect the `render.yaml` configuration.
4. Fill in the required environment variables in the Render dashboard (`OPENAI_API_KEY`, `DATABASE_URL`).
5. Click **Apply**. Render will automatically run `build.sh` (which builds both Python and React) and start the Uvicorn server.

### Option 2: Vercel (Serverless)

This application is configured as a monorepo for Vercel, utilizing `vercel.json` to handle routing.

**Vercel Project Settings:**
1. Import your GitHub repository to Vercel.
2. Leave the Framework Preset as **Other** (do NOT select Vite).
3. Set the **Build Command** to: `cd frontend && npm install && npm run build`
4. Set the **Output Directory** to: `frontend/dist`
5. Set the **Install Command** to: `pip install -r requirements.txt` (Vercel uses `vercel.json` for Python but sometimes requires this).
6. Add your Environment Variables (`OPENAI_API_KEY`, `DATABASE_URL`).

### How it works on Vercel
- The `vercel.json` file routes all API traffic (`/chat`, `/voice/*`) to `api/index.py`.
- `api/index.py` exposes the FastAPI app to Vercel's Python runtime.
- The React application is built via the static-build step and handled by the catch-all routing.

## Twilio Voice Setup

To enable voice calls:
1. Deploy this app to Vercel.
2. Go to your Twilio Console.
3. Configure your Twilio Phone Number's **Voice Webhook** to point to your Vercel deployment:
   `https://your-vercel-app-url.vercel.app/voice/incoming` (HTTP POST)
