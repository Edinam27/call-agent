import asyncio
import os
from dotenv import load_dotenv
from app.llm_service import LLMService

async def test_llm():
    load_dotenv()
    print(f"OPENAI_API_KEY present: {bool(os.getenv('OPENAI_API_KEY'))}")
    
    service = LLMService()
    print(f"Provider: {service.provider}")
    
    history = [{"role": "user", "content": "Hello"}]
    print("Sending request...")
    response = await service.get_response(history)
    print(f"Response: {response}")

if __name__ == "__main__":
    asyncio.run(test_llm())
