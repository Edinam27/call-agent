from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, Request, HTTPException, Response
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from typing import List, Dict, Any
import json
import os

from .database import engine, Base, get_db, AsyncSessionLocal
from .models import Conversation, Lead
from .schemas import ChatRequest, ChatResponse, CallAnalysis
from .llm_service import LLMService

app = FastAPI(title="UPSA SOGS AI Agent - Kojo")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm_service = LLMService()

@app.get("/api/admin/leads")
async def get_admin_leads(db: AsyncSession = Depends(get_db)):
    """Fetch all leads for the admin dashboard"""
    result = await db.execute(select(Lead).order_by(Lead.id.desc()))
    leads = result.scalars().all()
    
    return [
        {
            "id": lead.id,
            "name": lead.name,
            "contact_info": lead.phone_number,
            "program_of_interest": lead.program_interest,
            "highest_degree": lead.degree_level,
            "created_at": lead.created_at.isoformat() if lead.created_at else "Recent"
        }
        for lead in leads
    ]

@app.get("/api/admin/conversations")
async def get_admin_conversations(db: AsyncSession = Depends(get_db)):
    """Fetch all conversations for the admin dashboard"""
    result = await db.execute(select(Conversation).order_by(Conversation.id.desc()))
    conversations = result.scalars().all()
    
    return [
        {
            "id": convo.id,
            "session_id": convo.session_id,
            "history": convo.history,
            "created_at": convo.created_at.isoformat() if convo.created_at else "Recent"
        }
        for convo in conversations
    ]

# Serve static files from the frontend build directory
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")


@app.on_event("startup")
async def startup():
    # In a serverless environment (Vercel), we should be careful with DB creation on every boot.
    # It's better to run migrations (Alembic) separately, but for this project:
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"DB Startup Error: {e}")

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    # 1. Retrieve or create conversation history
    result = await db.execute(select(Conversation).where(Conversation.session_id == request.session_id))
    conversation = result.scalars().first()

    if not conversation:
        conversation = Conversation(session_id=request.session_id, history=[])
        db.add(conversation)
        await db.commit() # Commit to get ID and ensure it exists
        await db.refresh(conversation)
    
    # Ensure history is a list (JSON field can be None if not default properly or on some DBs)
    history = conversation.history if conversation.history else []
    
    # 2. Append user message
    history.append({"role": "user", "content": request.message})
    
    # 3. Get LLM response
    # Pass a copy to avoid mutating the list in place if the service modifies it (it shouldn't)
    reply = await llm_service.get_response(history)
    
    # 4. Append assistant response
    history.append({"role": "assistant", "content": reply})
    
    # 5. Update DB
    # We must assign a new list or use flag_modified for SQLAlchemy to detect JSON change
    conversation.history = list(history) 
    await db.commit()
    
    return ChatResponse(reply=reply, session_id=request.session_id)

@app.post("/analyze/{session_id}", response_model=CallAnalysis)
async def analyze_conversation(session_id: str, db: AsyncSession = Depends(get_db)):
    """
    Manually trigger analysis for a completed conversation session.
    """
    result = await db.execute(select(Conversation).where(Conversation.session_id == session_id))
    conversation = result.scalars().first()
    
    if not conversation or not conversation.history:
        raise HTTPException(status_code=404, detail="Conversation not found or empty")
    
    # Convert history to a readable transcript string
    transcript = "\n".join([f"{msg['role'].upper()}: {msg['content']}" for msg in conversation.history])
    
    analysis_data = await llm_service.analyze_call(transcript)
    
    # Save to Leads table
    # We use session_id as the phone_number identifier for chat, or actual caller_id for Twilio
    result_lead = await db.execute(select(Lead).where(Lead.phone_number == session_id))
    lead = result_lead.scalars().first()
    
    if not lead:
        lead = Lead(phone_number=session_id)
        db.add(lead)
        
    # Update lead fields with extracted data
    for key, value in analysis_data.items():
        if hasattr(lead, key) and value:
            setattr(lead, key, value)
            
    await db.commit()
    await db.refresh(lead)
    
    return CallAnalysis(**analysis_data)

@app.post("/voice/incoming")
async def voice_incoming(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Twilio Webhook for incoming calls.
    Returns TwiML to GATHER speech input (Turn-based conversation).
    This is more reliable and cost-effective than streaming for simple enquiries.
    """
    from twilio.twiml.voice_response import VoiceResponse, Gather
    
    # Get form data (Twilio sends form-encoded data)
    form_data = await request.form()
    call_sid = form_data.get("CallSid")
    
    # Initialize conversation if needed
    result = await db.execute(select(Conversation).where(Conversation.session_id == call_sid))
    conversation = result.scalars().first()
    
    if not conversation:
        conversation = Conversation(session_id=call_sid, history=[])
        db.add(conversation)
        await db.commit()
    
    response = VoiceResponse()
    
    # Initial Greeting
    greeting = "Good day. Thank you for calling the University of Professional Studies, Accra — School of Graduate Studies. My name is Kojo. How may I assist you today?"
    
    # Gather speech input
    gather = Gather(input="speech", action="/voice/respond", method="POST", language="en-GB", speechTimeout="auto")
    gather.say(greeting, voice="alice") # "alice" is a decent default, or use <Play> with our TTS later
    response.append(gather)
    
    # If no input, redirect to respond to handle silence properly (generic prompt)
    response.redirect("/voice/respond")
    
    return HTMLResponse(content=str(response), media_type="application/xml")

@app.post("/voice/respond")
async def voice_respond(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Handle the speech result from Twilio <Gather>.
    """
    from twilio.twiml.voice_response import VoiceResponse, Gather
    
    form_data = await request.form()
    call_sid = form_data.get("CallSid")
    speech_result = form_data.get("SpeechResult")
    
    response = VoiceResponse()
    
    if not speech_result:
        # If no speech detected, prompt again
        gather = Gather(input="speech", action="/voice/respond", method="POST", language="en-GB")
        gather.say("I didn't catch that. Could you please repeat?", voice="alice")
        response.append(gather)
        return HTMLResponse(content=str(response), media_type="application/xml")
        
    # Retrieve conversation history
    result = await db.execute(select(Conversation).where(Conversation.session_id == call_sid))
    conversation = result.scalars().first()
    
    history = conversation.history if conversation and conversation.history else []
    
    # Add User Input
    history.append({"role": "user", "content": speech_result})
    
    # Get LLM Response
    reply_text = await llm_service.get_response(history)
    
    # Add Assistant Response
    history.append({"role": "assistant", "content": reply_text})
    
    # Update DB
    if conversation:
        conversation.history = list(history)
        await db.commit()
    
    # Output Response
    # We can use <Say> for simplicity and speed (cheapest)
    # Or generate audio via OpenAI TTS and <Play> it (better quality, slightly slower/costlier)
    
    # Using <Say> for reliability first. "alice" (en-GB) is good for UPSA context.
    # Note: reply_text might be long. We should keep it concise.
    
    gather = Gather(input="speech", action="/voice/respond", method="POST", language="en-GB", speechTimeout="auto")
    gather.say(reply_text, voice="alice")
    response.append(gather)
    
    # Loop if silence
    response.redirect("/voice/respond")
    
    return HTMLResponse(content=str(response), media_type="application/xml")


@app.post("/voice/status")
async def voice_status(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Twilio Webhook for Call Status changes (e.g., completed).
    Triggers lead extraction and CRM update when the call ends.
    """
    form_data = await request.form()
    call_sid = form_data.get("CallSid")
    call_status = form_data.get("CallStatus")
    caller = form_data.get("From")
    
    if call_status == "completed" and call_sid:
        # Retrieve conversation history
        result = await db.execute(select(Conversation).where(Conversation.session_id == call_sid))
        conversation = result.scalars().first()
        
        if conversation and conversation.history:
            transcript = "\n".join([f"{msg['role'].upper()}: {msg['content']}" for msg in conversation.history])
            
            # Analyze conversation
            analysis_data = await llm_service.analyze_call(transcript)
            
            # Update Lead in Database
            result_lead = await db.execute(select(Lead).where(Lead.phone_number == caller))
            lead = result_lead.scalars().first()
            
            if not lead:
                lead = Lead(phone_number=caller)
                db.add(lead)
                
            for key, value in analysis_data.items():
                if hasattr(lead, key) and value:
                    setattr(lead, key, value)
                    
            await db.commit()
            print(f"Lead updated for caller {caller}: {analysis_data}")
            
    return Response(status_code=200)

@app.websocket("/voice/stream")
async def voice_stream(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connected")
    
    # We would need to manage state here (buffering audio, etc.)
    
    try:
        while True:
            data = await websocket.receive_text()
            packet = json.loads(data)
            
            if packet['event'] == 'start':
                print(f"Stream started: {packet['start']['streamSid']}")
            elif packet['event'] == 'media':
                # payload = packet['media']['payload']
                # audio_chunk = base64.b64decode(payload)
                # For real-time, we'd send this to Deepgram/OpenAI Realtime
                # For now, we just log to show flow
                pass
            elif packet['event'] == 'stop':
                print("Stream stopped")
                break
                
    except WebSocketDisconnect:
        print("WebSocket disconnected")

@app.get("/api/admin/analytics")
async def get_admin_analytics(db: AsyncSession = Depends(get_db)):
    """Fetch analytics data for the admin dashboard"""
    # Get total calls/conversations
    calls_result = await db.execute(select(func.count(Conversation.id)))
    total_calls = calls_result.scalar()

    # Get total leads
    leads_result = await db.execute(select(func.count(Lead.id)))
    total_leads = leads_result.scalar()

    # Get recent activity (mix of recent leads and conversations)
    recent_leads = await db.execute(select(Lead).order_by(Lead.id.desc()).limit(5))
    leads = recent_leads.scalars().all()
    
    activity = []
    for lead in leads:
        activity.append({
            "id": f"lead-{lead.id}",
            "type": "Lead Generated",
            "detail": f"{lead.program_interest or 'Unknown Program'}",
            "time": "Recent" # Would use actual timestamp if added to model
        })

    # Get recent conversations for LLM analysis
    recent_convos = await db.execute(select(Conversation).order_by(Conversation.id.desc()).limit(10))
    convos = recent_convos.scalars().all()
    
    transcripts = []
    for c in convos:
        if c.history:
            # Format history into a readable transcript
            transcript = "\n".join([f"{msg.get('role', 'unknown')}: {msg.get('content', '')}" for msg in c.history])
            transcripts.append(transcript)
            
    # Generate insights using LLM
    insights_data = await llm_service.generate_admin_insights(transcripts)

    return {
        "totalCalls": total_calls or 0,
        "totalLeads": total_leads or 0,
        "commonIssues": insights_data.get("top_issues", [
            {"topic": "Admissions Process", "count": min(15, total_calls)},
            {"topic": "Fees & Scholarships", "count": min(12, total_calls)},
            {"topic": "Program Requirements", "count": min(8, total_calls)}
        ]),
        "recentActivity": activity,
        "insight": insights_data.get("insight", "Gathering more data for insights...")
    }

# Serve static files from the frontend build directory
# We remove the `if os.path.exists(frontend_dist):` check so that FastAPI 
# ALWAYS registers these routes, even if the directory isn't created 
# at the exact millisecond the Python file is loaded by Uvicorn.

# Mount the frontend dist directory to serve static files correctly
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

@app.get("/", response_class=HTMLResponse)
async def serve_index():
    """Serve the React app root"""
    index_path = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    # Render debug info
    files = []
    if os.path.exists(frontend_dist):
        files = os.listdir(frontend_dist)
    
    return JSONResponse(status_code=404, content={
        "message": "Frontend index.html not found", 
        "path": index_path,
        "frontend_dir_exists": os.path.exists(frontend_dist),
        "files_in_dist": files
    })

# Catch-all route to serve the React SPA for client-side routing
@app.api_route("/{path_name:path}", methods=["GET"])
async def catch_all(path_name: str):
    """Serve static files or index.html for SPA routing"""
    # Exclude API routes from the catch-all
    api_routes = ["api", "chat", "analyze", "voice", "docs", "openapi.json"]
    if any(path_name.startswith(route) for route in api_routes):
        raise HTTPException(status_code=404, detail="API Route Not Found")
        
    # Check if it's a specific static file (like vite.svg, robots.txt, etc)
    file_path = os.path.join(frontend_dist, path_name)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
        
    # Otherwise, serve index.html (SPA routing)
    index_path = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return JSONResponse(status_code=404, content={"message": "Frontend not found"})
