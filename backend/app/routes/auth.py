"""
Authentication routes.
"""

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.models.user import UserRegister, UserLogin, UserResponse, Token
from app.services.auth_service import AuthService
from app.utils.security import get_current_user
from app.models.user import TokenData

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(
    user_data: UserRegister,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Register a new user.
    
    - **email**: Valid email address
    - **password**: Password (minimum 6 characters)
    - **age**: User's age (1-120)
    """
    auth_service = AuthService(db)
    return await auth_service.register(user_data)


@router.post("/login", response_model=Token)
async def login(
    credentials: UserLogin,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Authenticate user and get access token.
    
    - **email**: Registered email address
    - **password**: User's password
    """
    auth_service = AuthService(db)
    return await auth_service.login(credentials)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get current authenticated user's information.
    """
    auth_service = AuthService(db)
    return await auth_service.get_user_by_id(current_user.user_id)
