"""
Pydantic models for User operations.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    """User registration request model."""
    email: EmailStr
    password: str = Field(..., min_length=6)
    age: int = Field(..., ge=1, le=120)


class UserLogin(BaseModel):
    """User login request model."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """User response model (excludes password)."""
    id: str
    email: str
    age: int
    created_at: datetime


class UserInDB(BaseModel):
    """User model as stored in database."""
    email: str
    hashed_password: str
    age: int
    created_at: datetime
    viewed_genres: list[str] = []


class Token(BaseModel):
    """JWT token response model."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Data extracted from JWT token."""
    email: Optional[str] = None
    user_id: Optional[str] = None
    age: Optional[int] = None
