"""
Show service for movie/TV show operations.
"""

from typing import Optional, List
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException, status

from app.models.show import (
    ShowResponse,
    ShowListResponse,
    ShowDetailResponse,
    RecommendationResponse
)
from app.utils.helpers import parse_genres, is_adult_rating, calculate_pages


class ShowService:
    """Service class for show operations."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.shows
        self.users_collection = db.users
    
    async def get_shows(
        self,
        page: int = 1,
        limit: int = 15,
        show_type: Optional[str] = None,
        search: Optional[str] = None,
        genre: Optional[str] = None,
        user_age: Optional[int] = None
    ) -> ShowListResponse:
        """Get paginated list of shows with filters."""
        
        # Build query
        query = {}
        
        # Filter by type (Movie or TV Show)
        if show_type:
            query["type"] = show_type
        
        # Search by title or cast
        if search:
            query["$text"] = {"$search": search}
        
        # Filter by genre
        if genre:
            query["listed_in"] = {"$regex": genre, "$options": "i"}
        
        # Age restriction - users under 18 should not see R-rated content
        if user_age is not None and user_age < 18:
            query["rating"] = {"$nin": ["R", "NC-17", "TV-MA"]}
        
        # Calculate skip
        skip = (page - 1) * limit
        
        # Get total count
        total = await self.collection.count_documents(query)
        
        # Get shows
        cursor = self.collection.find(query).skip(skip).limit(limit)
        shows = await cursor.to_list(length=limit)
        
        # Transform to response
        show_responses = [
            ShowResponse(
                id=str(show["_id"]),
                show_id=show.get("show_id", ""),
                type=show.get("type", ""),
                title=show.get("title", ""),
                director=show.get("director"),
                cast=show.get("cast"),
                country=show.get("country"),
                date_added=show.get("date_added"),
                release_year=show.get("release_year"),
                rating=show.get("rating"),
                duration=show.get("duration"),
                listed_in=show.get("listed_in"),
                description=show.get("description")
            )
            for show in shows
        ]
        
        total_pages = calculate_pages(total, limit)
        
        return ShowListResponse(
            shows=show_responses,
            total=total,
            page=page,
            pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )
    
    async def get_show_by_id(self, show_id: str) -> ShowDetailResponse:
        """Get detailed show information by ID."""
        
        # Try to find by MongoDB _id first, then by show_id
        show = None
        
        try:
            show = await self.collection.find_one({"_id": ObjectId(show_id)})
        except:
            pass
        
        if not show:
            show = await self.collection.find_one({"show_id": show_id})
        
        if not show:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Show not found"
            )
        
        return ShowDetailResponse(
            id=str(show["_id"]),
            show_id=show.get("show_id", ""),
            type=show.get("type", ""),
            title=show.get("title", ""),
            director=show.get("director"),
            cast=show.get("cast"),
            country=show.get("country"),
            date_added=show.get("date_added"),
            release_year=show.get("release_year"),
            rating=show.get("rating"),
            duration=show.get("duration"),
            listed_in=show.get("listed_in"),
            description=show.get("description"),
            genres=parse_genres(show.get("listed_in", ""))
        )
    
    async def track_view(self, user_id: str, show_id: str) -> None:
        """Track that a user viewed a show (for recommendations)."""
        
        # Get the show
        show = await self.get_show_by_id(show_id)
        
        # Get genres from the show
        genres = parse_genres(show.listed_in)
        
        if genres:
            # Add genres to user's viewed_genres (using $addToSet to avoid duplicates)
            await self.users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$addToSet": {"viewed_genres": {"$each": genres}}}
            )
    
    async def get_recommendations(
        self,
        user_id: str,
        user_age: Optional[int] = None,
        limit: int = 10
    ) -> RecommendationResponse:
        """Get genre-based recommendations for a user."""
        
        # Get user's viewed genres
        user = await self.users_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user or not user.get("viewed_genres"):
            # Return random shows if no viewing history
            return await self._get_random_recommendations(user_age, limit)
        
        viewed_genres = user["viewed_genres"]
        
        # Build query for recommendations
        query = {
            "$or": [
                {"listed_in": {"$regex": genre, "$options": "i"}}
                for genre in viewed_genres[:5]  # Use top 5 genres
            ]
        }
        
        # Age restriction
        if user_age is not None and user_age < 18:
            query["rating"] = {"$nin": ["R", "NC-17", "TV-MA"]}
        
        # Get recommended shows
        cursor = self.collection.aggregate([
            {"$match": query},
            {"$sample": {"size": limit}}
        ])
        
        shows = await cursor.to_list(length=limit)
        
        show_responses = [
            ShowResponse(
                id=str(show["_id"]),
                show_id=show.get("show_id", ""),
                type=show.get("type", ""),
                title=show.get("title", ""),
                director=show.get("director"),
                cast=show.get("cast"),
                country=show.get("country"),
                date_added=show.get("date_added"),
                release_year=show.get("release_year"),
                rating=show.get("rating"),
                duration=show.get("duration"),
                listed_in=show.get("listed_in"),
                description=show.get("description")
            )
            for show in shows
        ]
        
        return RecommendationResponse(
            shows=show_responses,
            based_on_genres=viewed_genres[:5]
        )
    
    async def _get_random_recommendations(
        self,
        user_age: Optional[int] = None,
        limit: int = 10
    ) -> RecommendationResponse:
        """Get random recommendations when user has no viewing history."""
        
        query = {}
        
        # Age restriction
        if user_age is not None and user_age < 18:
            query["rating"] = {"$nin": ["R", "NC-17", "TV-MA"]}
        
        cursor = self.collection.aggregate([
            {"$match": query},
            {"$sample": {"size": limit}}
        ])
        
        shows = await cursor.to_list(length=limit)
        
        show_responses = [
            ShowResponse(
                id=str(show["_id"]),
                show_id=show.get("show_id", ""),
                type=show.get("type", ""),
                title=show.get("title", ""),
                director=show.get("director"),
                cast=show.get("cast"),
                country=show.get("country"),
                date_added=show.get("date_added"),
                release_year=show.get("release_year"),
                rating=show.get("rating"),
                duration=show.get("duration"),
                listed_in=show.get("listed_in"),
                description=show.get("description")
            )
            for show in shows
        ]
        
        return RecommendationResponse(
            shows=show_responses,
            based_on_genres=[]
        )
    
    async def get_genres(self) -> List[str]:
        """Get all unique genres from the database."""
        
        cursor = self.collection.aggregate([
            {"$project": {"listed_in": 1}},
            {"$unwind": {"path": "$listed_in", "preserveNullAndEmptyArrays": False}},
        ])
        
        # This is a simplified version - in production, you'd want to
        # split the listed_in field and get unique genres
        genres_set = set()
        
        async for doc in self.collection.find({}, {"listed_in": 1}):
            if doc.get("listed_in"):
                for genre in parse_genres(doc["listed_in"]):
                    genres_set.add(genre)
        
        return sorted(list(genres_set))
