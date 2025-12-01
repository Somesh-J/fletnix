"""
Script to import Netflix CSV data into MongoDB.

Usage:
    python scripts/import_data.py
"""

import csv
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
import sys

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import get_settings

settings = get_settings()


async def import_data():
    """Import Netflix CSV data into MongoDB."""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    collection = db.shows
    
    # Path to CSV file
    csv_path = Path(__file__).parent.parent.parent / "data" / "netflix_titles.csv"
    
    if not csv_path.exists():
        print(f"❌ CSV file not found at: {csv_path}")
        return
    
    print(f"📂 Reading CSV from: {csv_path}")
    
    # Clear existing data
    await collection.delete_many({})
    print("🗑️  Cleared existing data")
    
    # Read and insert data (only first 4000 records to save disk space)
    shows = []
    max_records = 4000  # Limit records to save disk space on free tier
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for i, row in enumerate(reader):
            if i >= max_records:
                break
                
            # Clean and transform data
            show = {
                "show_id": row.get("show_id", ""),
                "type": row.get("type", ""),
                "title": row.get("title", ""),
                "director": row.get("director") or None,
                "cast": row.get("cast") or None,
                "country": row.get("country") or None,
                "date_added": row.get("date_added") or None,
                "release_year": int(row.get("release_year")) if row.get("release_year") else None,
                "rating": row.get("rating") or None,
                "duration": row.get("duration") or None,
                "listed_in": row.get("listed_in") or None,
                "description": row.get("description") or None,
            }
            shows.append(show)
    
    # Batch insert
    if shows:
        result = await collection.insert_many(shows)
        print(f"✅ Inserted {len(result.inserted_ids)} shows")
    
    # Create indexes (with error handling for disk space issues)
    try:
        await collection.create_index([
            ("title", "text"),
            ("cast", "text"),
            ("director", "text"),
            ("description", "text")
        ])
        await collection.create_index("type")
        await collection.create_index("rating")
        await collection.create_index("listed_in")
        await collection.create_index("show_id")
        print("📑 Created indexes")
    except Exception as e:
        print(f"⚠️  Could not create indexes (may be disk space issue): {e}")
    
    # Close connection
    client.close()
    print("✅ Data import completed successfully!")


if __name__ == "__main__":
    asyncio.run(import_data())
