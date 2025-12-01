"""
Routes package initialization.
"""

from app.routes.auth import router as auth_router
from app.routes.shows import router as shows_router

__all__ = ["auth_router", "shows_router"]
