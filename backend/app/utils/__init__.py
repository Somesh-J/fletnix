"""
Utils package initialization.
"""

from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
    get_current_user,
    get_current_user_optional
)
from app.utils.helpers import (
    parse_genres,
    is_adult_rating,
    calculate_pages
)

__all__ = [
    "hash_password",
    "verify_password",
    "create_access_token",
    "decode_access_token",
    "get_current_user",
    "get_current_user_optional",
    "parse_genres",
    "is_adult_rating",
    "calculate_pages"
]
