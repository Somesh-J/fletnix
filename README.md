# 🎬 FletNix - What to Watch

A Netflix content discovery application that helps users search, filter, and discover movies and TV shows with personalized recommendations.

![FletNix Banner](https://img.shields.io/badge/FletNix-Netflix%20Clone-red?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.11+-blue?style=flat-square&logo=python)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green?style=flat-square&logo=mongodb)

## 🌟 Features

- **🔐 Authentication**: Secure login/register with email, password, and age verification
- **📄 Paginated List**: Browse all content with 15 items per page
- **🔍 Search**: Search by movie/TV show title or cast members
- **🔞 Age Restriction**: Users under 18 won't see R-rated content
- **🎭 Filter by Type**: Toggle between Movies and TV Shows
- **📋 Detail Page**: View complete information about each title
- **⭐ Movie Reviews**: IMDB ratings and reviews integration
- **🎯 Genre Recommendations**: Personalized suggestions based on viewing history
- **📱 Responsive UI**: Beautiful Tailwind CSS design for all devices

## 🌐 Production URLs

**Frontend:**  
https://frontend-production-e81f.up.railway.app

**Backend API:**  
https://backend-production-1549.up.railway.app/api

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Python FastAPI |
| Database | MongoDB |
| Authentication | JWT + bcrypt |
| External API | OMDB API |
| Testing | Playwright |

## 📁 Project Structure

```
fletnix/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── main.py         # App entry point
│   │   ├── config.py       # Configuration
│   │   ├── database.py     # MongoDB connection
│   │   ├── models/         # Pydantic models
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utilities
│   ├── scripts/
│   │   └── import_data.py  # CSV import script
│   └── requirements.txt
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── context/        # React context
│   └── package.json
├── tests/                   # Playwright E2E tests
├── data/                    # Netflix CSV data
└── docker-compose.yml
```

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Import data to MongoDB:**
   ```bash
   python scripts/import_data.py
   ```

6. **Run the server:**
   ```bash
   uvicorn app.main:app --reload
   ```

   Backend will be available at `http://localhost:8000`


### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:5173`

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### Shows
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shows` | List shows (paginated) |
| GET | `/api/shows/{id}` | Get show details |
| GET | `/api/shows/{id}/reviews` | Get IMDB reviews |

### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recommendations` | Get personalized recommendations |
| POST | `/api/views` | Track view history |

### Query Parameters for `/api/shows`
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 15)
- `type` - Filter by "Movie" or "TV Show"
- `search` - Search in title and cast
- `genre` - Filter by genre

---
