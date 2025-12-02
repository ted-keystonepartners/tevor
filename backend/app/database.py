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

# Determine if we're using async (SQLite) or sync (PostgreSQL)
IS_ASYNC = not DATABASE_URL.startswith("postgresql://")

Base = declarative_base()

if IS_ASYNC:
    # For SQLite, use async operations
    ASYNC_DATABASE_URL = DATABASE_URL.replace("sqlite://", "sqlite+aiosqlite://", 1)
    engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)
    
    SessionLocal = sessionmaker(
        engine, 
        class_=AsyncSession,
        expire_on_commit=False
    )
    
    async def get_db():
        async with SessionLocal() as db:
            try:
                yield db
            finally:
                await db.close()
    
    async def init_db():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
else:
    # For PostgreSQL on Render, use sync with optimized settings
    from sqlalchemy.orm import Session
    
    # Create sync engine with optimized pooling for Render
    engine = create_engine(
        DATABASE_URL, 
        echo=False,
        pool_size=3,  # Reduced for Render's connection limits
        max_overflow=5,  # Reduced overflow
        pool_pre_ping=True,  # Verify connections
        pool_recycle=300,  # Recycle every 5 minutes
        connect_args={
            "connect_timeout": 10,
            "options": "-c statement_timeout=30000"  # 30 second statement timeout
        }
    )
    
    SessionLocal = sessionmaker(
        engine,
        class_=Session,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False
    )
    
    def get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    
    async def init_db():
        # Run synchronously for PostgreSQL
        Base.metadata.create_all(bind=engine)