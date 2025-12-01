"""
IMDB/OMDB service for fetching movie reviews and ratings.
"""

import httpx
from typing import Optional
from app.config import get_settings
from app.models.show import ShowReviewsResponse, ReviewResponse

settings = get_settings()


class IMDBService:
    """Service for fetching IMDB data via OMDB API."""
    
    BASE_URL = "http://www.omdbapi.com/"
    
    def __init__(self):
        self.api_key = settings.omdb_api_key
    
    async def get_movie_reviews(
        self,
        title: str,
        year: Optional[int] = None
    ) -> ShowReviewsResponse:
        """Fetch movie/show reviews from OMDB API."""
        
        if not self.api_key:
            return ShowReviewsResponse(
                title=title,
                reviews=[],
                imdb_rating=None,
                imdb_votes=None,
                metascore=None,
                poster=None
            )
        
        params = {
            "apikey": self.api_key,
            "t": title,
            "plot": "full"
        }
        
        if year:
            params["y"] = year
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self.BASE_URL, params=params, timeout=10.0)
                data = response.json()
                
                if data.get("Response") == "False":
                    return ShowReviewsResponse(
                        title=title,
                        reviews=[],
                        imdb_rating=None,
                        imdb_votes=None,
                        metascore=None,
                        poster=None
                    )
                
                # Parse ratings from different sources
                reviews = []
                ratings = data.get("Ratings", [])
                
                for rating in ratings:
                    reviews.append(ReviewResponse(
                        source=rating.get("Source", "Unknown"),
                        rating=rating.get("Value", "N/A"),
                        review=None
                    ))
                
                return ShowReviewsResponse(
                    title=data.get("Title", title),
                    imdb_rating=data.get("imdbRating"),
                    imdb_votes=data.get("imdbVotes"),
                    metascore=data.get("Metascore"),
                    reviews=reviews,
                    poster=data.get("Poster") if data.get("Poster") != "N/A" else None
                )
        
        except Exception as e:
            print(f"Error fetching OMDB data: {e}")
            return ShowReviewsResponse(
                title=title,
                reviews=[],
                imdb_rating=None,
                imdb_votes=None,
                metascore=None,
                poster=None
            )
