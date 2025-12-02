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
    # For PostgreSQL, use async operations with optimized pooling
    from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
    import asyncpg
    
    # Convert to async PostgreSQL URL
    ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    # Create async engine with optimized connection pooling
    engine = create_async_engine(
        ASYNC_DATABASE_URL,
        echo=False,
        pool_size=5,  # Number of connections to maintain
        max_overflow=10,  # Maximum overflow connections
        pool_pre_ping=True,  # Verify connections before using
        pool_recycle=3600,  # Recycle connections after 1 hour
        connect_args={
            "server_settings": {
                "application_name": "tevor",
                "jit": "off"  # Disable JIT for faster query startup
            },
            "command_timeout": 60,
            "timeout": 30,
        }
    )
    
    SessionLocal = sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False
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