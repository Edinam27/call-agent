from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Fallback for local testing if no Neon URL provided
    print("WARNING: DATABASE_URL not set. Database features will fail.")
    # On Vercel, sqlite cannot be written to reliably, but we need a dummy string
    # if it's not provided to avoid crash on startup before env vars are loaded.
    DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Important: connection pooling settings for serverless
engine = create_async_engine(
    DATABASE_URL, 
    echo=False,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
