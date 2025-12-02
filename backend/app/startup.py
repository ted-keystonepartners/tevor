import asyncio
from app.database import engine, init_db, get_db
from app.models.project import Project
from sqlalchemy import select
import logging

logger = logging.getLogger(__name__)

async def warmup_db():
    """Warm up database connections and cache"""
    try:
        # Initialize database tables
        await init_db()
        
        # Pre-create connection pool
        async with engine.begin() as conn:
            # Simple query to establish connections
            await conn.execute(select(1))
        
        # Warm up the connection pool with multiple connections
        tasks = []
        for _ in range(3):
            async def test_connection():
                async for db in get_db():
                    try:
                        # Simple query to warm up connection
                        result = await db.execute(select(Project).limit(1))
                        result.scalar()
                    except Exception:
                        pass  # Ignore if no projects exist
                    break
            
            tasks.append(test_connection())
        
        await asyncio.gather(*tasks)
        logger.info("Database connection pool warmed up successfully")
        
    except Exception as e:
        logger.error(f"Error warming up database: {e}")

async def startup_event():
    """Run startup tasks"""
    await warmup_db()