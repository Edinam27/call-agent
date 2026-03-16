# UPSA SOGS AI Agent - Abena

This is an AI Call & Chat Agent for the University of Professional Studies, Accra (UPSA) School of Graduate Studies (SOGS).

## Features

- **Conversational Agent**: Handles enquiries about programmes, admissions, fees, and deadlines.
- **Voice & Chat**: Supports text-based chat and Twilio Voice integration.
- **CRM Integration**: Auto-detects lead details (Programme Interest, Degree Level, etc.) and stores them in a Neon Postgres database.
- **LLM Powered**: Uses Anthropic Claude 3.5 Sonnet (recommended) or OpenAI GPT-4o.

## Tech Stack

- **Backend**: Python, FastAPI
- **Database**: Neon (Serverless PostgreSQL) + SQLAlchemy (Async)
- **LLM**: Anthropic / OpenAI
- **Telephony**: Twilio (TwiML & Media Streams)

## Setup

1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Environment Variables**:
    Copy `.env.example` to `.env` and fill in your keys.
    ```bash
    cp .env.example .env
    ```
    - `DATABASE_URL`: Your Neon Postgres connection string.
    - `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`: For the LLM.

3.  **Run the Agent**:
    ```bash
    python run.py
    ```
    Access the Chat UI at `http://localhost:8000`.

## Endpoints

- `GET /`: Simple Chat UI.
- `POST /chat`: Chat API endpoint.
- `POST /voice/incoming`: Twilio Webhook URL.
- `WS /voice/stream`: WebSocket for audio streaming.
- `POST /analyze/{session_id}`: Trigger CRM field extraction for a conversation.

## Deployment

To deploy for voice calls:
1.  Deploy this app to a public server (e.g., Render, Railway, Fly.io).
2.  Configure your Twilio Phone Number's Voice Webhook to `https://your-domain.com/voice/incoming`.
