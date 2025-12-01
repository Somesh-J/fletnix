"""
Shows routes for movies and TV shows.
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.models.show import (
    ShowListResponse,
    ShowDetailResponse,
    ShowReviewsResponse,
    ViewHistoryCreate,
    RecommendationResponse
)
from app.models.user import TokenData
from app.services.show_service import ShowService
from app.services.imdb_service import IMDBService
from app.utils.security import get_current_user, get_current_user_optional

router = APIRouter(prefix="/shows", tags=["Shows"])


@router.get("", response_model=ShowListResponse)
async def get_shows(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(15, ge=1, le=100, description="Items per page"),
    type: Optional[str] = Query(None, description="Filter by type: Movie or TV Show"),
    search: Optional[str] = Query(None, description="Search in title, cast, director"),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    kids_mode: bool = Query(False, description="Filter out R-rated and adult content"),
    current_user: Optional[TokenData] = Depends(get_current_user_optional),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get paginated list of shows with optional filters.
    
    - **page**: Page number (default: 1)
    - **limit**: Items per page (default: 15, max: 100)
    - **type**: Filter by "Movie" or "TV Show"
    - **search**: Search in title, cast, and director
    - **genre**: Filter by genre
    - **kids_mode**: Filter out R-rated/TV-MA content (default: false)
    
    Note: Users under 18 will not see R-rated content.
    """
    show_service = ShowService(db)
    user_age = current_user.age if current_user else None
    
    return await show_service.get_shows(
        page=page,
        limit=limit,
        show_type=type,
        search=search,
        genre=genre,
        user_age=user_age,
        kids_mode=kids_mode
    )


@router.get("/genres", response_model=List[str])
async def get_genres(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get all available genres.
    """
    show_service = ShowService(db)
    return await show_service.get_genres()


@router.get("/{show_id}", response_model=ShowDetailResponse)
async def get_show(
    show_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get detailed information about a specific show.
    
    - **show_id**: MongoDB ID or show_id of the show
    """
    show_service = ShowService(db)
    return await show_service.get_show_by_id(show_id)


@router.get("/{show_id}/reviews", response_model=ShowReviewsResponse)
async def get_show_reviews(
    show_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get IMDB reviews and ratings for a show.
    
    - **show_id**: MongoDB ID or show_id of the show
    """
    show_service = ShowService(db)
    imdb_service = IMDBService()
    
    # Get show details
    show = await show_service.get_show_by_id(show_id)
    
    # Fetch IMDB data
    return await imdb_service.get_movie_reviews(
        title=show.title,
        year=show.release_year
    )


@router.post("/view", status_code=201)
async def track_view(
    view_data: ViewHistoryCreate,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Track that a user viewed a show (for recommendations).
    
    - **show_id**: ID of the show that was viewed
    """
    show_service = ShowService(db)
    await show_service.track_view(current_user.user_id, view_data.show_id)
    return {"message": "View tracked successfully"}


@router.get("/user/recommendations", response_model=RecommendationResponse)
async def get_recommendations(
    limit: int = Query(10, ge=1, le=50, description="Number of recommendations"),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get genre-based recommendations for the current user.
    
    Recommendations are based on the genres of shows the user has viewed.
    """
    show_service = ShowService(db)
    return await show_service.get_recommendations(
        user_id=current_user.user_id,
        user_age=current_user.age,
        limit=limit
    )
