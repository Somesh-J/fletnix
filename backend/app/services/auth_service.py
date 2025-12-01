"""
Authentication service for user operations.
"""

from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException, status

from app.models.user import UserRegister, UserLogin, UserResponse, Token
from app.utils.security import hash_password, verify_password, create_access_token


class AuthService:
    """Service class for authentication operations."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.users
    
    async def register(self, user_data: UserRegister) -> UserResponse:
        """Register a new user."""
        # Check if user already exists
        existing_user = await self.collection.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user document
        user_doc = {
            "email": user_data.email,
            "hashed_password": hash_password(user_data.password),
            "age": user_data.age,
            "created_at": datetime.utcnow(),
            "viewed_genres": []
        }
        
        # Insert user
        result = await self.collection.insert_one(user_doc)
        
        return UserResponse(
            id=str(result.inserted_id),
            email=user_data.email,
            age=user_data.age,
            created_at=user_doc["created_at"]
        )
    
    async def login(self, credentials: UserLogin) -> Token:
        """Authenticate user and return JWT token."""
        # Find user
        user = await self.collection.find_one({"email": credentials.email})
        
        if not user or not verify_password(credentials.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token = create_access_token(
            data={
                "sub": user["email"],
                "user_id": str(user["_id"]),
                "age": user["age"]
            }
        )
        
        return Token(access_token=access_token)
    
    async def get_user_by_id(self, user_id: str) -> UserResponse:
        """Get user by ID."""
        user = await self.collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            age=user["age"],
            created_at=user["created_at"]
        )
