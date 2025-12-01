"""
MongoDB database connection and initialization.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import get_settings

settings = get_settings()


class Database:
    """MongoDB database connection manager."""
    
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None


db = Database()


async def connect_to_database():
    """Connect to MongoDB and create indexes."""
    db.client = AsyncIOMotorClient(settings.mongodb_url)
    db.db = db.client[settings.database_name]
    
    # Create indexes (with error handling for disk space issues on free tiers)
    try:
        # Create text index for search functionality
        await db.db.shows.create_index([
            ("title", "text"),
            ("cast", "text"),
            ("director", "text"),
            ("description", "text")
        ])
        
        # Create index for efficient filtering
        await db.db.shows.create_index("type")
        await db.db.shows.create_index("rating")
        await db.db.shows.create_index("listed_in")
        
        # Create index for users
        await db.db.users.create_index("email", unique=True)
        
        print("📑 Created indexes")
    except Exception as e:
        print(f"⚠️  Could not create indexes (continuing without): {e}")
    
    print("✅ Connected to MongoDB")


async def close_database_connection():
    """Close MongoDB connection."""
    if db.client:
        db.client.close()
        print("❌ Disconnected from MongoDB")


def get_database() -> AsyncIOMotorDatabase:
    """Get database instance."""
    return db.db
