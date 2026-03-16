import os
import base64
import json
import asyncio
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

class VoiceService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
    async def process_audio_chunk(self, audio_payload: str) -> str:
        """
        Process incoming audio chunk (base64) and return text.
        Note: This is a placeholder for a real streaming STT.
        OpenAI Whisper API does not support streaming raw chunks easily without buffering.
        For this demo, we might need to buffer or use a different approach.
        """
        # Buffer audio? 
        # Real-time processing usually requires Deepgram or similar.
        pass

    async def text_to_speech(self, text: str) -> str:
        """
        Convert text to speech and return base64 audio payload.
        """
        try:
            response = await self.client.audio.speech.create(
                model="tts-1",
                voice="shimmer", # "shimmer" is often clearer for female voices
                input=text,
                response_format="mp3" # Twilio Media Stream supports mulaw 8khz usually, but let's see
            )
            
            # OpenAI returns binary
            # NOTE: Twilio Media Streams require mulaw 8000Hz.
            # OpenAI TTS returns mp3/opus/aac/flac.
            # We would need `pydub` or `ffmpeg` to convert to mulaw 8k.
            # For simplicity, we might skip conversion if we just want to prove flow, 
            # but it likely won't play correctly on the phone without conversion.
            
            audio_content = response.content
            return base64.b64encode(audio_content).decode("utf-8")
        except Exception as e:
            print(f"TTS Error: {e}")
            return ""

    async def transcribe_audio(self, audio_bytes: bytes) -> str:
        """
        Transcribe complete audio file bytes.
        """
        # We need to save to a temp file or use a BytesIO with a name
        import io
        
        file_obj = io.BytesIO(audio_bytes)
        file_obj.name = "audio.wav" # Whisper needs a filename
        
        try:
            transcript = await self.client.audio.transcriptions.create(
                model="whisper-1",
                file=file_obj
            )
            return transcript.text
        except Exception as e:
            print(f"STT Error: {e}")
            return ""
