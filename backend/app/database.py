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

# Create database URL with appropriate driver
if DATABASE_URL.startswith("postgresql://"):
    # For PostgreSQL, use psycopg2 synchronously (asyncpg not compatible with Python 3.13)
    # We'll use synchronous operations for PostgreSQL
    ASYNC_DATABASE_URL = DATABASE_URL
    IS_ASYNC = False
else:
    # For SQLite, use aiosqlite for async operations
    ASYNC_DATABASE_URL = DATABASE_URL.replace("sqlite://", "sqlite+aiosqlite://", 1)
    IS_ASYNC = True

# Create engine based on database type
if IS_ASYNC:
    engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)
else:
    from sqlalchemy import create_engine as create_sync_engine
    engine = create_sync_engine(ASYNC_DATABASE_URL, echo=False, future=True, pool_pre_ping=True)
Base = declarative_base()

if IS_ASYNC:
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
    from sqlalchemy.orm import Session
    SessionLocal = sessionmaker(
        engine,
        class_=Session,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False
    )
    
    async def get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    
    async def init_db():
        Base.metadata.create_all(bind=engine)