"""
Pydantic models for Show operations.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ShowBase(BaseModel):
    """Base show model with common fields."""
    show_id: str
    type: str
    title: str
    director: Optional[str] = None
    cast: Optional[str] = None
    country: Optional[str] = None
    date_added: Optional[str] = None
    release_year: Optional[int] = None
    rating: Optional[str] = None
    duration: Optional[str] = None
    listed_in: Optional[str] = None
    description: Optional[str] = None


class ShowResponse(ShowBase):
    """Show response model."""
    id: str
    poster: Optional[str] = None
    imdb_rating: Optional[str] = None
    
    class Config:
        from_attributes = True


class ShowListResponse(BaseModel):
    """Paginated list of shows response."""
    shows: List[ShowResponse]
    total: int
    page: int
    pages: int
    has_next: bool
    has_prev: bool


class ShowDetailResponse(ShowBase):
    """Detailed show response with additional data."""
    id: str
    genres: List[str] = []
    imdb_rating: Optional[str] = None
    imdb_votes: Optional[str] = None
    poster: Optional[str] = None


class ReviewResponse(BaseModel):
    """IMDB review response model."""
    source: str
    rating: str
    review: Optional[str] = None


class ShowReviewsResponse(BaseModel):
    """Combined reviews response for a show."""
    title: str
    imdb_rating: Optional[str] = None
    imdb_votes: Optional[str] = None
    metascore: Optional[str] = None
    reviews: List[ReviewResponse] = []
    poster: Optional[str] = None


class ViewHistoryCreate(BaseModel):
    """Request to track a view."""
    show_id: str


class RecommendationResponse(BaseModel):
    """Recommendation response model."""
    shows: List[ShowResponse]
    based_on_genres: List[str]
