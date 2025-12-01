"""
Helper utility functions.
"""

from typing import List


def parse_genres(listed_in: str) -> List[str]:
    """Parse genres from the listed_in field."""
    if not listed_in:
        return []
    return [genre.strip() for genre in listed_in.split(",")]


def is_adult_rating(rating: str) -> bool:
    """Check if a rating is for adults only (R-rated)."""
    adult_ratings = ["R", "NC-17", "TV-MA"]
    return rating in adult_ratings if rating else False


def calculate_pages(total: int, limit: int) -> int:
    """Calculate total number of pages."""
    return (total + limit - 1) // limit if limit > 0 else 0
