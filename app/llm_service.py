import os
import json
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import openai
from openai import AsyncOpenAI
import anthropic
from anthropic import AsyncAnthropic
from .system_prompt import SYSTEM_PROMPT

load_dotenv()

class LLMService:
    def __init__(self):
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        
        self.provider = "openai" # Default fallback
        if self.anthropic_api_key and self.anthropic_api_key.startswith("sk-ant"):
            self.provider = "anthropic"
            self.anthropic_client = AsyncAnthropic(api_key=self.anthropic_api_key)
        elif self.openai_api_key:
            self.provider = "openai"
            self.openai_client = AsyncOpenAI(api_key=self.openai_api_key)
        else:
            print("WARNING: No API key found for Anthropic or OpenAI.")

    async def get_response(self, history: List[Dict[str, str]]) -> str:
        """
        Get response from LLM based on history.
        History format: [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
        """
        if self.provider == "anthropic":
            return await self._get_anthropic_response(history)
        else:
            return await self._get_openai_response(history)

    async def _get_anthropic_response(self, history: List[Dict[str, str]]) -> str:
        try:
            # Anthropic expects specific role names: user, assistant
            # System prompt is passed separately
            response = await self.anthropic_client.messages.create(
                model="claude-3-5-sonnet-20241022", # Using latest stable Sonnet
                max_tokens=1000,
                temperature=0.4,
                system=SYSTEM_PROMPT,
                messages=history
            )
            return response.content[0].text
        except Exception as e:
            print(f"Anthropic API Error: {e}")
            return "I apologise for the technical difficulty. Please hold while I reconnect — or you can reach us directly at 0303-937542."

    async def _get_openai_response(self, history: List[Dict[str, str]]) -> str:
        try:
            messages = [{"role": "system", "content": SYSTEM_PROMPT}] + history
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                temperature=0.4,
                max_tokens=1000
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API Error: {e}")
            return "I apologise for the technical difficulty. Please hold while I reconnect — or you can reach us directly at 0303-937542."

    async def analyze_call(self, transcript: str) -> Dict[str, Any]:
        """
        Analyze the call transcript to extract CRM fields as per Section 4.
        """
        analysis_prompt = """
        Analyze the following call transcript and extract the CRM fields as JSON.
        
        Fields to extract:
        - program_interest (e.g., "MBA Marketing", "PhD Finance")
        - degree_level ("Doctorate", "Research Masters", "Masters")
        - session_preference ("evening", "weekend", "distance", "regular")
        - enquiry_type ("Application", "Fees", "Requirements", "Deadlines", "Programme Info", "Distance Learning")
        - caller_qualification (e.g., "ACCA", "ICAG")
        - call_outcome ("Enquiry Resolved", "Escalated", "Call Back Required", "Application Intended")
        
        Return ONLY valid JSON.
        """
        
        messages = [
            {"role": "user", "content": f"{analysis_prompt}\n\nTranscript:\n{transcript}"}
        ]
        
        try:
            if self.provider == "anthropic":
                response = await self.anthropic_client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=1000,
                    messages=messages
                )
                content = response.content[0].text
            else:
                response = await self.openai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=[{"role": "system", "content": "You are a helpful assistant that extracts JSON."}, {"role": "user", "content": f"{analysis_prompt}\n\nTranscript:\n{transcript}"}],
                    response_format={"type": "json_object"}
                )
                content = response.choices[0].message.content
            
            # Simple cleanup just in case
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].strip()
                
            return json.loads(content)
        except Exception as e:
            print(f"Analysis Error: {e}")
            return {}
