from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from .database import Base

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, index=True)
    email = Column(String, nullable=True)
    name = Column(String, nullable=True)
    program_interest = Column(String, nullable=True)
    degree_level = Column(String, nullable=True)
    session_preference = Column(String, nullable=True)
    enquiry_type = Column(String, nullable=True)
    qualification = Column(String, nullable=True)
    call_outcome = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)  # Twilio Call SID or Chat Session ID
    history = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
