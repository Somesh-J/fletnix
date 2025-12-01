"""
Configuration settings for FletNix backend.

Explicit configuration following the Zen of Python:
- Explicit is better than implicit.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # MongoDB
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "fletnix"
    
    # JWT
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours
    
    # OMDB API
    omdb_api_key: str = ""
    
    # CORS - Frontend URL for production
    frontend_url: str = "http://localhost:5173"
    
    # Environment
    environment: str = "development"
    
    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
