import httpx
import asyncio

async def test_voice_flow():
    base_url = "http://localhost:8000"
    call_sid = "test-call-12345"
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # 1. Incoming Call
        print("\n--- Testing /voice/incoming ---")
        response = await client.post(
            f"{base_url}/voice/incoming",
            data={"CallSid": call_sid}
        )
        print(f"Status: {response.status_code}")
        print(f"TwiML: {response.text}")
        assert "<Gather" in response.text
        
        # 2. User Responds (Simulated Speech)
        print("\n--- Testing /voice/respond (User: 'When is the deadline?') ---")
        response = await client.post(
            f"{base_url}/voice/respond",
            data={
                "CallSid": call_sid,
                "SpeechResult": "When is the deadline for the next intake?"
            }
        )
        print(f"Status: {response.status_code}")
        print(f"TwiML: {response.text}")
        assert "<Say" in response.text
        
        # 3. User Follows up
        print("\n--- Testing /voice/respond (User: 'What are the fees?') ---")
        response = await client.post(
            f"{base_url}/voice/respond",
            data={
                "CallSid": call_sid,
                "SpeechResult": "How much are the fees for an MBA?"
            }
        )
        print(f"Status: {response.status_code}")
        print(f"TwiML: {response.text}")
        assert "<Say" in response.text

if __name__ == "__main__":
    asyncio.run(test_voice_flow())
