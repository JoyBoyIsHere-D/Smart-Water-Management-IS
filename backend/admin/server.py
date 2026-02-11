"""
Federated Learning Admin Server (FastAPI)
Coordinates federated learning across multiple client devices.

Run with: python server.py
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Try to import authentication
try:
    from auth.routes import router as auth_router
    from auth.database import ensure_tables, close_pool
    from config import settings, validate_settings
    AUTH_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Auth module not available: {e}")
    AUTH_AVAILABLE = False
    
    async def ensure_tables():
        pass
    
    async def close_pool():
        pass

# Try to import TensorFlow
try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("Warning: TensorFlow not available. Model training will be simulated.")

# Import route modules
from routes import clients_router, data_router, model_router, training_router, users_router

# Create FastAPI app
app = FastAPI(
    title="Federated Learning Admin Server",
    version="2.0.0",
    description="Coordinates federated learning across multiple client devices"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative dev port
        "https://smart-water-management-is.vercel.app",  # Production frontend
        "*",  # Temporary: Allow all origins for testing
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
if AUTH_AVAILABLE:
    app.include_router(auth_router)

app.include_router(clients_router)
app.include_router(data_router)
app.include_router(model_router)
app.include_router(training_router)
app.include_router(users_router)

# Lifecycle events
if AUTH_AVAILABLE:
    @app.on_event("startup")
    async def startup_db():
        """Initialize PostgreSQL pool and ensure tables exist on startup."""
        try:
            await ensure_tables()
            print("✅ PostgreSQL ready")
        except Exception as e:
            print(f"⚠️  PostgreSQL startup error: {e}")

    @app.on_event("shutdown")
    async def shutdown_db():
        """Close database connection pool."""
        await close_pool()


# Health check and info routes
@app.get("/api/health")
async def health_check():
    """Admin server health check"""
    from routes.clients import get_clients
    from routes.training import training_status
    
    return {
        "status": "online",
        "server": "admin",
        "registered_clients": len(get_clients()),
        "training_active": training_status['is_training'],
        "auth_available": AUTH_AVAILABLE
    }


@app.get("/")
async def index():
    """API information and available endpoints"""
    return {
        "name": "Federated Learning Admin Server",
        "version": "2.0.0",
        "framework": "FastAPI",
        "tensorflow_available": TF_AVAILABLE,
        "auth_available": AUTH_AVAILABLE,
        "endpoints": {
            "Authentication": {
                "POST /api/auth/register": "Register new user",
                "POST /api/auth/login": "Login with email/password",
                "POST /api/auth/refresh": "Refresh access token",
                "POST /api/auth/logout": "Logout user",
                "GET /api/auth/me": "Get current user info",
                "PUT /api/auth/profile": "Update user profile",
                "POST /api/auth/password-update": "Update password",
                "GET /api/auth/verify": "Verify token validity"
            },
            "Client Management": {
                "GET /api/clients": "List registered clients",
                "POST /api/clients": "Register new client",
                "DELETE /api/clients/{id}": "Remove client",
                "GET /api/clients/health": "Check all clients health"
            },
            "Data": {
                "GET /api/remote-data": "Fetch data from specific client",
                "GET /api/all-clients-data": "Fetch data from all clients",
                "GET /api/all-clients-metrics": "Fetch model metrics from all clients",
                "GET /api/data/statistics": "Get training data statistics"
            },
            "Federated Training": {
                "GET /api/training/status": "Get training status",
                "GET /api/training/history": "Get training round history",
                "POST /api/training/start": "Start federated training",
                "POST /api/training/stop": "Stop ongoing training"
            },
            "Model": {
                "GET /api/model/info": "Get model information",
                "GET /api/model/download": "Download trained model",
                "POST /api/model/predict": "Make water quality prediction"
            },
            "Health": {
                "GET /api/health": "Server health check"
            }
        }
    }


if __name__ == '__main__':
    import uvicorn
    
    print("\n" + "="*60)
    print("  FEDERATED LEARNING ADMIN SERVER v2.0")
    print("="*60)
    print(f"\n  TensorFlow: {'✓' if TF_AVAILABLE else '✗'}")
    print(f"  Authentication: {'✓ (PostgreSQL)' if AUTH_AVAILABLE else '✗'}")
    print("="*60 + "\n")
    
    # Validate settings if auth is available
    if AUTH_AVAILABLE:
        validate_settings()
    
    print("Starting server on http://0.0.0.0:5000\n")
    
    uvicorn.run(app, host="0.0.0.0", port=5000)
