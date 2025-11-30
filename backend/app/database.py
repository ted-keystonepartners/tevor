import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
import asyncio

# Get database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///db/tevor.db")

# Handle PostgreSQL URL from Render (convert postgres:// to postgresql://)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Create async database URL
if DATABASE_URL.startswith("postgresql://"):
    # For PostgreSQL, use asyncpg
    ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
else:
    # For SQLite, use aiosqlite
    ASYNC_DATABASE_URL = DATABASE_URL.replace("sqlite://", "sqlite+aiosqlite://", 1)

# Create async engine with appropriate settings
if "postgresql" in ASYNC_DATABASE_URL:
    engine = create_async_engine(ASYNC_DATABASE_URL, echo=False, future=True)
else:
    engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)
SessionLocal = sessionmaker(
    engine, 
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with SessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)