# Backend Project Structure

## Overview
The backend has been reorganized into a clean, modular architecture with separated concerns.

## Directory Structure

```
backend/
├── admin/
│   ├── server.py          # Main FastAPI application (streamlined)
│   └── server_old.py      # Backup of old monolithic server
│
├── auth/                  # Authentication module
│   ├── __init__.py       
│   ├── database.py        # PostgreSQL database operations
│   ├── jwt_handler.py     # JWT token creation and validation
│   ├── models.py          # Pydantic models for auth
│   ├── routes.py          # Authentication API routes
│   └── utils.py           # Auth utility functions (password hashing, etc.)
│
├── core/                  # Core utilities
│   ├── __init__.py
│   └── utils.py           # Shared utilities (JSON cleaning, model creation, etc.)
│
├── routes/                # API route modules
│   ├── __init__.py
│   ├── clients.py         # Client management routes
│   ├── data.py            # Data fetching and statistics routes
│   ├── model.py           # Model operations routes
│   └── training.py        # Federated learning training routes
│
├── client/
│   └── server.py          # Client server (unchanged)
│
├── config.py              # Configuration settings (PostgreSQL, JWT, etc.)
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables
└── .env.example           # Template for environment variables
```

## Module Responsibilities

### `auth/` - Authentication
- **database.py**: PostgreSQL connection pool and CRUD operations for users
- **jwt_handler.py**: JWT token generation and validation
- **models.py**: Pydantic models for request/response validation
- **routes.py**: Auth endpoints (register, login, logout, profile, etc.)
- **utils.py**: Password hashing and user data transformation

### `core/` - Core Utilities
- **utils.py**: Shared functions used across the application
  - `clean_for_json()`: Handle NaN/Inf values for JSON serialization
  - `create_model()`: Create neural network models
  - `create_target()`: Generate target variables from data
  - `load_and_prepare_data()`: Load and split data for federated learning

### `routes/` - API Routes
- **clients.py**: Client device management
  - `GET /api/clients` - List all registered clients
  - `POST /api/clients` - Register a new client
  - `DELETE /api/clients/{id}` - Remove a client
  - `GET /api/clients/health` - Health check for all clients

- **data.py**: Data operations
  - `GET /api/remote-data` - Fetch data from specific client
  - `GET /api/all-clients-data` - Aggregate data from all clients
  - `GET /api/all-clients-metrics` - Fetch metrics from all clients
  - `GET /api/data/statistics` - Dataset statistics

- **model.py**: Model operations
  - `GET /api/model/info` - Model information
  - `GET /api/model/download` - Download trained model
  - `POST /api/model/predict` - Make predictions

- **training.py**: Federated learning
  - `GET /api/training/status` - Current training status
  - `GET /api/training/history` - Training round history
  - `POST /api/training/start` - Start training
  - `POST /api/training/stop` - Stop training

### `admin/server.py` - Main Application
Clean, streamlined FastAPI application that:
- Imports and registers all route modules
- Configures CORS middleware
- Sets up database lifecycle events
- Provides health check and API info endpoints

## Benefits of This Structure

1. **Modularity**: Each module has a single, clear responsibility
2. **Maintainability**: Easier to locate and update specific functionality
3. **Scalability**: Simple to add new routes or features
4. **Testability**: Individual modules can be tested independently
5. **Readability**: Clear separation of concerns makes code easier to understand
6. **Reusability**: Utility functions are centralized and can be imported where needed

## Migration from Old Structure

The old monolithic `server.py` (~1000 lines) has been:
- Backed up to `server_old.py`
- Replaced with a clean ~170 line version
- All functionality preserved but organized into logical modules

## Dependencies

Key Python packages:
- `fastapi` - Web framework
- `asyncpg` - PostgreSQL async driver
- `passlib[bcrypt]` - Password hashing
- `python-jose[cryptography]` - JWT tokens
- `tensorflow` - Machine learning (optional)
- `pandas`, `numpy`, `scikit-learn` - Data processing

## Configuration

Set environment variables in `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET_KEY=your-secret-key
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
SERVER_HOST=0.0.0.0
SERVER_PORT=5000
DEBUG=True
```

## Running the Server

```bash
cd backend/admin
python server.py
```

Server will start on `http://0.0.0.0:5000` with full API documentation at `/docs`.
