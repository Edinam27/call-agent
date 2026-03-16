import uvicorn
import os
from dotenv import load_dotenv

if __name__ == "__main__":
    load_dotenv()
    # Check for API Keys
    if not os.getenv("OPENAI_API_KEY") and not os.getenv("ANTHROPIC_API_KEY"):
        print("WARNING: No LLM API keys found in .env. The agent will fail to respond.")
    
    print("Starting UPSA SOGS AI Agent Abena...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
