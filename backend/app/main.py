"""
FletNix - Main FastAPI Application

A Netflix content discovery API with authentication, search, 
filtering, and personalized recommendations.

Built following the Zen of Python:
- Beautiful is better than ugly
- Simple is better than complex
- Readability counts
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.database import connect_to_database, close_database_connection
from app.routes import auth_router, shows_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown."""
    # Startup
    await connect_to_database()
    yield
    # Shutdown
    await close_database_connection()


# Create FastAPI application
app = FastAPI(
    title="FletNix API",
    description="""
    🎬 **FletNix** - Netflix Content Discovery API
    
    A comprehensive API for discovering movies and TV shows with:
    - User authentication with age verification
    - Paginated content listing
    - Search by title, cast, and director
    - Genre-based filtering
    - Age-appropriate content filtering
    - IMDB reviews integration
    - Personalized recommendations
    
    Built with ❤️ using FastAPI and MongoDB.
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS - Allow frontend origins for production and development
allowed_origins = [
    "https://frontend-production-e81f.up.railway.app",
    "http://localhost:5173",
    "http://localhost:3000",
]

# Add configured frontend URL if different
if settings.frontend_url and settings.frontend_url not in allowed_origins:
    allowed_origins.append(settings.frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(shows_router, prefix="/api")


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - API health check."""
    return {
        "message": "🎬 Welcome to FletNix API!",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
