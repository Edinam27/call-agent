from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    message: str
    session_id: str

class ChatResponse(BaseModel):
    reply: str
    session_id: str

class CallAnalysis(BaseModel):
    program_interest: Optional[str] = None
    degree_level: Optional[str] = None
    session_preference: Optional[str] = None
    enquiry_type: Optional[str] = None
    caller_qualification: Optional[str] = None
    call_outcome: Optional[str] = None
