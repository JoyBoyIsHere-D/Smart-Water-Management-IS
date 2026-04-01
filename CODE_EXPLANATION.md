# 🌊 Smart Water Management System — Complete Code Explanation

This document is a beginner-friendly, top-to-bottom walkthrough of every layer of the Smart Water Management System. It is meant to help anyone — whether new to the project or new to software development — understand *what* the code does, *why* it was written that way, and *how* all the pieces connect.

---

## 📋 Table of Contents

1. [What the Application Does (Big Picture)](#1-what-the-application-does-big-picture)
2. [How the Repository Is Organised](#2-how-the-repository-is-organised)
3. [Technology Stack — Why Each Tool Was Chosen](#3-technology-stack--why-each-tool-was-chosen)
4. [Architecture Diagram](#4-architecture-diagram)
5. [Backend Deep-Dive](#5-backend-deep-dive)
   - [Entry Point — `admin/server.py`](#51-entry-point--adminserverpy)
   - [Configuration — `config.py`](#52-configuration--configpy)
   - [Database Layer — `auth/database.py`](#53-database-layer--authdatabasepy)
   - [Authentication — `auth/routes.py` + `auth/jwt_handler.py`](#54-authentication--authroutespy--authjwt_handlerpy)
   - [Pydantic Models — `auth/models.py`](#55-pydantic-models--authmodelspy)
   - [Password Utilities — `auth/utils.py`](#56-password-utilities--authutilspy)
   - [IoT Sensor API — `routes/sensors.py`](#57-iot-sensor-api--routessensorspy)
   - [Portal User Management — `routes/users.py`](#58-portal-user-management--routesuserspy)
   - [Machine Learning Model — `routes/model.py`](#59-machine-learning-model--routesmodelpy)
   - [Federated Learning — `routes/training.py`](#510-federated-learning--routestrainingpy)
   - [ML Utilities — `core/utils.py`](#511-ml-utilities--coreutilspy)
   - [Sample Data — `seed_data.py`](#512-sample-data--seed_datapy)
   - [Client Server — `client/server.py`](#513-client-server--clientserverpy)
6. [Frontend Deep-Dive](#6-frontend-deep-dive)
   - [Application Entry — `main.jsx` & `App.jsx`](#61-application-entry--mainjsx--appjsx)
   - [Authentication Context — `context/AuthContext.jsx`](#62-authentication-context--contextauthcontextjsx)
   - [Layouts — `Layout.jsx` & `UserLayout.jsx`](#63-layouts--layoutjsx--userlayoutjsx)
   - [Route Protection — `ProtectedRoute.jsx`](#64-route-protection--protectedroutejsx)
   - [Pages Overview](#65-pages-overview)
   - [API Service — `services/sensorService.js`](#66-api-service--servicessensorservicejs)
7. [Database Schema Explained](#7-database-schema-explained)
8. [Key Data Flows (Step-by-Step)](#8-key-data-flows-step-by-step)
   - [Admin Login Flow](#81-admin-login-flow)
   - [Portal User Login Flow](#82-portal-user-login-flow)
   - [IoT Sensor Reading Flow](#83-iot-sensor-reading-flow)
   - [Dashboard Data Fetch Flow](#84-dashboard-data-fetch-flow)
   - [Federated Learning Training Flow](#85-federated-learning-training-flow)
9. [Water Quality Assessment Logic](#9-water-quality-assessment-logic)
10. [Machine Learning Model Explained](#10-machine-learning-model-explained)
11. [Federated Learning Explained](#11-federated-learning-explained)
12. [Docker & Deployment](#12-docker--deployment)
13. [Environment Variables Reference](#13-environment-variables-reference)
14. [How to Run Locally (Step-by-Step)](#14-how-to-run-locally-step-by-step)
15. [Sample API Requests (curl / Postman)](#15-sample-api-requests-curl--postman)
16. [Glossary of Terms](#16-glossary-of-terms)

---

## 1. What the Application Does (Big Picture)

The Smart Water Management Information System is a full-stack web application that:

| Capability | Description |
|-----------|-------------|
| **IoT Data Ingestion** | Accepts real-time sensor readings (pH, TDS, temperature, pressure, flow rate, dissolved oxygen) from physical devices (e.g., ESP32 microcontrollers) |
| **Water Quality Assessment** | Automatically classifies each reading as *Safe* or *Unsafe* with a risk level (Low / Medium / High) using rule-based logic |
| **AI Predictions** | Uses a pre-trained TensorFlow neural network to predict water quality from sensor data |
| **Federated Learning** | Trains the ML model in a privacy-preserving, distributed way — data never leaves the client devices |
| **Admin Dashboard** | Provides administrators with an overview of all water consumers' data, anomaly alerts, analytics, and ML training controls |
| **Consumer Portal** | Gives individual water consumers a private dashboard to view their own water quality data |
| **User Management** | Admins can create, update, and delete consumer (portal user) accounts |

---

## 2. How the Repository Is Organised

```
Smart-Water-Management-IS/
│
├── Frontend/                        ← React web application (user interface)
│   ├── src/
│   │   ├── components/
│   │   │   ├── pages/               ← One file per "page" of the app
│   │   │   ├── ui/                  ← Small reusable components (buttons, cards, etc.)
│   │   │   ├── Layout.jsx           ← Admin sidebar + header shell
│   │   │   ├── UserLayout.jsx       ← Consumer portal shell
│   │   │   └── ProtectedRoute.jsx   ← Guards pages that need a login
│   │   ├── context/
│   │   │   └── AuthContext.jsx      ← Global "who is logged in?" state
│   │   ├── services/
│   │   │   └── sensorService.js     ← All HTTP calls to the backend API
│   │   ├── config/                  ← API base URL configuration
│   │   ├── hooks/                   ← Custom React hooks
│   │   ├── data/                    ← Static/helper data utilities
│   │   ├── App.jsx                  ← Route table (which URL maps to which page)
│   │   └── main.jsx                 ← Browser entry point
│   ├── vite.config.js               ← Build tool configuration
│   ├── package.json                 ← Frontend dependencies list
│   └── Dockerfile                   ← Builds a production nginx image
│
├── backend/                         ← Python FastAPI server (handles all logic + data)
│   ├── admin/
│   │   └── server.py                ← FastAPI app — registers all routes + starts server
│   ├── auth/
│   │   ├── database.py              ← All PostgreSQL queries (create/read/update/delete)
│   │   ├── routes.py                ← HTTP endpoints for login, register, profile, etc.
│   │   ├── jwt_handler.py           ← Create and verify JWT tokens
│   │   ├── models.py                ← Pydantic schemas (request/response shapes)
│   │   └── utils.py                 ← Password hashing helpers
│   ├── routes/
│   │   ├── sensors.py               ← IoT device data submission and retrieval
│   │   ├── users.py                 ← Admin CRUD for portal users
│   │   ├── model.py                 ← ML model info, download, and prediction
│   │   ├── training.py              ← Federated learning orchestration
│   │   ├── clients.py               ← Client device registration / health
│   │   └── data.py                  ← Statistics and remote data fetching
│   ├── core/
│   │   └── utils.py                 ← Neural network builder + data preparation
│   ├── client/
│   │   └── server.py                ← Second FastAPI server for client-side FL
│   ├── data/                        ← CSV training datasets
│   ├── config.py                    ← Reads .env file into a settings object
│   ├── seed_data.py                 ← Creates test admin + portal users + readings
│   └── requirements.txt             ← Python dependency list
│
├── docker-compose.yml               ← Spins up frontend + backend + PostgreSQL together
├── .env.example                     ← Template for the required environment variables
├── README.md                        ← Quick-start guide
├── SystemDesign.md                  ← Detailed architecture document
├── DATA_Model.ipynb                 ← Jupyter notebook for data exploration / modelling
├── federated_learning.ipynb         ← Notebook demonstrating federated learning
├── federated_water_quality_model.h5 ← Pre-trained TensorFlow model file
└── water_quality_scaler.pkl         ← Scikit-learn StandardScaler (saved for inference)
```

---

## 3. Technology Stack — Why Each Tool Was Chosen

### Frontend

| Technology | Version | Role | Why |
|-----------|---------|------|-----|
| **React** | 19 | UI library | Industry-standard for building interactive dashboards |
| **Vite** | 7 | Build tool | Extremely fast dev server and build times |
| **Tailwind CSS** | 4 | Styling | Write styles directly in JSX; consistent design system |
| **React Router** | 7 | Client-side routing | Navigates between pages without full-page reloads |
| **Recharts** | 3 | Charts | Declarative React components for line/bar/pie charts |
| **Lucide React** | — | Icons | Lightweight icon set that matches modern UI style |
| **jsPDF** | — | PDF export | Lets users download dashboard reports as PDF files |

### Backend

| Technology | Version | Role | Why |
|-----------|---------|------|-----|
| **FastAPI** | ≥0.104 | Web framework | Python-native, async, auto-generates OpenAPI docs |
| **Uvicorn** | ≥0.24 | ASGI server | Runs FastAPI asynchronously and efficiently |
| **asyncpg** | ≥0.29 | Database driver | Async PostgreSQL driver; works seamlessly with FastAPI's async/await |
| **Pydantic** | ≥2.5 | Data validation | Validates request/response bodies with type hints |
| **TensorFlow / Keras** | ≥2.15 | Machine learning | Builds and trains the water quality classification model |
| **scikit-learn** | ≥1.3 | ML utilities | StandardScaler for feature normalisation |
| **pandas / numpy** | — | Data processing | Loading CSVs, computing statistics, array maths |
| **python-jose** | ≥3.3 | JWT tokens | Encodes and verifies JSON Web Tokens |
| **passlib[bcrypt]** | ≥1.7 | Password hashing | Securely hashes passwords before storing them |
| **python-dotenv** | ≥1.0 | Environment config | Loads `.env` file variables into the Python process |

### Infrastructure

| Tool | Role |
|------|------|
| **PostgreSQL 15** | Relational database storing all users and sensor readings |
| **Docker** | Packages each service as a portable, reproducible container |
| **Docker Compose** | Runs all containers (frontend, backend, database) with one command |

---

## 4. Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                     Browser (User)                       │
│                                                          │
│   React + Vite Frontend  (port 5173 / 3000)             │
│   ┌──────────────┐  ┌───────────────┐  ┌────────────┐  │
│   │ Admin Pages  │  │  User Portal  │  │ Auth Pages │  │
│   └──────────────┘  └───────────────┘  └────────────┘  │
└────────────────────────────┬─────────────────────────────┘
                             │  HTTP / JSON (REST API)
                             ▼
┌──────────────────────────────────────────────────────────┐
│           FastAPI Backend — Admin Server (port 5111)     │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │   Auth   │ │ Sensors  │ │  Users   │ │  Training │  │
│  │  Routes  │ │  Routes  │ │  Routes  │ │  Routes   │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│  │  Model   │ │  Data    │ │ Clients  │                 │
│  │  Routes  │ │  Routes  │ │  Routes  │                 │
│  └──────────┘ └──────────┘ └──────────┘                 │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              auth/database.py                    │   │
│  │        (asyncpg connection pool)                 │   │
│  └──────────────────────────┬───────────────────────┘   │
└───────────────────────────  │  ───────────────────────── ┘
                              │  SQL (asyncpg)
                              ▼
┌──────────────────────────────────────────────────────────┐
│              PostgreSQL Database (port 5432)             │
│                                                          │
│   ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│   │ admin_users │  │ portal_users │  │sensor_readings│  │
│   └─────────────┘  └──────────────┘  └───────────────┘  │
└──────────────────────────────────────────────────────────┘
          ▲
          │  POST /api/sensors/readings
          │  (IoT JSON payload)
┌─────────┴────────────┐
│  IoT Devices         │
│  (ESP32, etc.)       │
└──────────────────────┘
```

---

## 5. Backend Deep-Dive

### 5.1 Entry Point — `admin/server.py`

This is the **first file that runs** when you start the backend.

```
python admin/server.py
```

**What it does, line by line:**

1. **Imports FastAPI** and creates the application object with a title and description.
2. **Tries to import** authentication and TensorFlow. If they are not available (e.g., in a minimal install), the server still starts — it just skips those features.
3. **Configures CORS** (Cross-Origin Resource Sharing). CORS is a browser security rule that blocks JavaScript on one domain from calling APIs on a different domain. The middleware here explicitly *allows* the frontend to call the backend.
4. **Registers all route modules** (`auth_router`, `sensors_router`, `users_router`, etc.). Each router is a group of related endpoints defined in a separate file.
5. **Lifecycle hooks** — on startup, it creates all database tables if they don't exist. On shutdown, it closes the database connection pool gracefully.
6. **Health check endpoint** at `GET /api/health` — returns the server status so monitoring tools (or the frontend) can verify the API is alive.
7. **Root endpoint** at `GET /` — returns a full menu of all available API endpoints, serving as a human-readable API reference.

```python
# Simplified version of what happens at startup
app = FastAPI(title="Federated Learning Admin Server")
app.add_middleware(CORSMiddleware, allow_origins=[...])
app.include_router(auth_router)        # /api/auth/*
app.include_router(sensors_router)     # /api/sensors/*
app.include_router(users_router)       # /api/users/*
# ... and so on
```

---

### 5.2 Configuration — `config.py`

This file reads the `.env` file and exposes a `settings` object used throughout the backend.

```python
settings.DATABASE_URL          # postgresql://user:pass@host/db
settings.JWT_SECRET_KEY        # secret used to sign tokens
settings.JWT_ALGORITHM         # "HS256"
settings.SERVER_HOST           # "0.0.0.0"
settings.SERVER_PORT           # 5111
settings.CORS_ALLOW_ORIGINS    # comma-separated list of allowed origins
```

**Why a settings object?** Centralising configuration avoids hard-coding values in multiple files. When you deploy to production, you only need to change one `.env` file.

---

### 5.3 Database Layer — `auth/database.py`

This is the **heart of all database interactions**. It uses `asyncpg` — an async PostgreSQL driver — meaning database queries don't block the server while waiting for results.

#### Connection Pool

```python
pool = await asyncpg.create_pool(DATABASE_URL, min_size=2, max_size=10)
```

A *connection pool* keeps a set of open database connections ready to reuse. Opening a new connection for every request would be too slow.

#### Tables Created (`ensure_tables`)

```sql
-- Table 1: Administrator accounts
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_sign_in TIMESTAMPTZ
);

-- Table 2: Water consumer accounts (no password required)
CREATE TABLE portal_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unique_id TEXT UNIQUE NOT NULL,   -- e.g. "WU-2024-001"
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    area TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 3: All IoT sensor readings
CREATE TABLE sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES portal_users(id),
    unique_id TEXT NOT NULL,
    ph NUMERIC,
    pressure NUMERIC,
    flow_rate NUMERIC,
    total_volume_passed NUMERIC,
    temperature NUMERIC,
    tds INTEGER,
    dissolved_oxygen NUMERIC,
    water_quality TEXT,
    risk_level TEXT,
    device_id TEXT,
    location TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Key Functions

| Function | What it does |
|----------|-------------|
| `get_pool()` | Returns the shared connection pool (creates it if first call) |
| `ensure_tables()` | Creates all tables on startup if they don't exist |
| `get_user_by_email(email)` | Fetches an admin user row by email |
| `create_user(...)` | Inserts a new admin user |
| `get_portal_user_by_unique_id(uid)` | Fetches a portal user by their unique ID |
| `create_portal_user(...)` | Creates a new portal user (admin only) |
| `create_sensor_reading(...)` | Inserts a new IoT sensor reading |
| `get_sensor_readings_by_unique_id(uid, limit, offset)` | Paginated list of readings for a user |
| `get_latest_reading_by_unique_id(uid)` | Most recent reading only |
| `get_sensor_statistics(uid)` | Aggregate stats (avg pH, avg TDS, safe/unsafe counts, etc.) |
| `get_all_users_latest_readings()` | One row per portal user, their latest reading — used by admin dashboard |

---

### 5.4 Authentication — `auth/routes.py` + `auth/jwt_handler.py`

#### How JWT Authentication Works

1. The client sends credentials (email + password for admin, or just unique_id for portal users).
2. The server validates the credentials against the database.
3. If valid, the server creates two tokens:
   - **Access token** — short-lived (30 minutes), sent with every API request
   - **Refresh token** — long-lived (7 days), used to get a new access token without re-logging in
4. Both tokens are sent back to the client and stored in `localStorage`.
5. For protected endpoints, the client attaches the access token in the `Authorization: Bearer <token>` HTTP header.
6. The server's `get_current_user` FastAPI dependency automatically verifies the token and extracts the user identity.

```python
# How a JWT token is created
payload = {
    "sub": user_id,       # "subject" — who this token belongs to
    "email": "...",
    "exp": now + 30min,   # expiry timestamp
    "iat": now,           # issued-at timestamp
    "type": "access"      # distinguishes access vs refresh tokens
}
token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
```

```python
# How protected endpoints use it
@router.get("/me")
async def get_me(current_user = Depends(get_current_active_user)):
    # FastAPI calls get_current_active_user before entering this function
    # If the token is missing or invalid, it returns 401 automatically
    return current_user
```

#### Auth Endpoints

| Method | Path | What it does |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Create a new admin account; returns tokens |
| `POST` | `/api/auth/login` | Login with email + password; returns tokens |
| `POST` | `/api/auth/refresh` | Exchange a refresh token for a new access token |
| `POST` | `/api/auth/logout` | Confirmation endpoint (client clears tokens locally) |
| `GET` | `/api/auth/me` | Return the current user's profile (requires valid token) |
| `PUT` | `/api/auth/profile` | Update name / avatar URL |
| `POST` | `/api/auth/password-update` | Change password |
| `GET` | `/api/auth/verify` | Check whether the current token is still valid |

---

### 5.5 Pydantic Models — `auth/models.py`

Pydantic models serve as **contracts** between the client and server — they define exactly what JSON shape is expected and automatically validate it.

```python
class UserCreate(BaseModel):
    email: EmailStr           # must be a valid email format
    password: str             # min 6 chars (validated in validator)
    full_name: Optional[str]  # optional

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str           # always "bearer"
    expires_in: int           # seconds until access token expires
    user: UserResponse
```

If the client sends incorrect data (e.g., an invalid email), FastAPI automatically returns a `422 Unprocessable Entity` with a clear error message — no manual validation code needed.

---

### 5.6 Password Utilities — `auth/utils.py`

```python
def hash_password(password: str) -> str:
    # Uses bcrypt — a slow hashing algorithm designed for passwords
    # Each hash includes a unique random "salt" to prevent rainbow table attacks
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    # bcrypt re-hashes the plain-text and compares — never decrypts
    return pwd_context.verify(plain, hashed)
```

**Why bcrypt?** Regular hashing algorithms (like SHA-256) are fast — which is bad for passwords because attackers can try billions of guesses per second. Bcrypt is intentionally slow, making brute-force attacks infeasible.

---

### 5.7 IoT Sensor API — `routes/sensors.py`

This is the endpoint that **IoT devices** (physical sensors in water pipes or tanks) call to submit data.

#### Sensor Reading Schema

```python
class SensorReadingCreate(BaseModel):
    unique_id: str          # which consumer's water this belongs to
    ph: float               # 0–14 scale
    pressure: float         # bar
    flow_rate: float        # litres/minute
    total_volume_passed: float  # cumulative litres
    temperature: float      # °C
    tds: int                # Total Dissolved Solids in ppm
    # Optional extras
    dissolved_oxygen: Optional[float]
    device_id: Optional[str]
    location: Optional[str]
```

#### What Happens When a Reading is Submitted

```
IoT Device → POST /api/sensors/readings

Step 1: Validate unique_id exists in portal_users table
         └─ If not found → 404 error
Step 2: Assess water quality (see Section 9 for logic)
         └─ Returns ("Safe"/"Unsafe", "Low"/"Medium"/"High")
Step 3: Store reading in sensor_readings table
Step 4: Return success + quality assessment to the IoT device
```

#### Water Quality Assessment (inside `assess_water_quality`)

```python
def assess_water_quality(ph, tds, temperature):
    issues = []
    if ph < 6.5 or ph > 8.5:      issues.append("pH out of range")
    if tds > 500:                   issues.append("High TDS")
    if temperature < 10 or temperature > 35:   issues.append("Temperature out of range")

    if len(issues) == 0:  return ("Safe", "Low")
    if len(issues) == 1:  return ("Unsafe", "Medium")
    else:                 return ("Unsafe", "High")
```

---

### 5.8 Portal User Management — `routes/users.py`

Portal users are **water consumers** — they log in with only their unique ID (no password). Admins manage these accounts.

| Endpoint | Role needed | Description |
|----------|-------------|-------------|
| `POST /api/users/login` | None | Consumer logs in using unique_id |
| `POST /api/users/register` | Admin | Admin creates a new consumer account |
| `GET /api/users` | Admin | List all consumers |
| `GET /api/users/{id}` | Admin | Get one consumer's details |
| `PUT /api/users/{id}` | Admin | Update consumer details |
| `DELETE /api/users/{id}` | Admin | Remove consumer account |

When a portal user logs in:
1. The server looks up the unique_id in `portal_users`.
2. If found, it issues a JWT with `role: "user"`.
3. The frontend redirects to the user portal at `/user`.

---

### 5.9 Machine Learning Model — `routes/model.py`

| Endpoint | Description |
|----------|-------------|
| `GET /api/model/info` | Returns model architecture metadata (layer count, parameter count, etc.) |
| `GET /api/model/download` | Streams the `.h5` model file for download |
| `POST /api/model/predict` | Accepts sensor values, runs inference, returns prediction |

The model file (`federated_water_quality_model.h5`) is loaded from disk when the server starts. Predictions are made by passing normalised feature values through the network and returning the binary output (0 = safe, 1 = unsafe).

---

### 5.10 Federated Learning — `routes/training.py`

This module manages the **Federated Learning training pipeline**.

| Endpoint | Description |
|----------|-------------|
| `GET /api/training/status` | Whether training is running, current round, metrics |
| `GET /api/training/history` | List of all completed training rounds |
| `POST /api/training/start` | Begin training; accepts config (rounds, clients, epochs) |
| `POST /api/training/stop` | Interrupt an in-progress training run |

**How training works (simplified):**
1. The admin clicks "Start Training" on the dashboard.
2. The server loads the CSV dataset and splits it across N simulated clients.
3. Each simulated client trains a local copy of the model on its data slice.
4. The server collects all clients' model weights and averages them (FedAvg algorithm).
5. Steps 3–4 repeat for the configured number of rounds.
6. The final averaged model is saved as `federated_water_quality_model.h5`.

See [Section 11](#11-federated-learning-explained) for a deeper explanation.

---

### 5.11 ML Utilities — `core/utils.py`

#### `create_model(input_shape)`

Builds the neural network architecture:

```
Input (n features)
  ↓
Dense(32, relu) + L2 regularisation
  ↓
Dropout(0.3)          ← randomly zeros 30% of neurons during training to reduce overfitting
  ↓
Dense(16, relu) + L2
  ↓
Dropout(0.3)
  ↓
Dense(8, relu) + L2
  ↓
Dropout(0.2)
  ↓
Dense(1, sigmoid)     ← output: probability between 0 and 1
                         > 0.5 = unsafe, <= 0.5 = safe
```

Compiled with:
- **Optimizer**: Adam (adaptive learning rate — one of the most widely used optimisers)
- **Loss**: Binary cross-entropy (standard for binary classification)
- **Metrics**: Accuracy, Precision, Recall

#### `load_and_prepare_data(data_path, num_clients)`

1. Loads the CSV file with `pandas`.
2. Creates a binary `unsafe` target column using `create_target()`.
3. Normalises numeric columns with `StandardScaler` (subtracts mean, divides by std deviation).
4. One-hot encodes categorical columns (e.g., `ph_status` → `ph_status_Acidic`, `ph_status_Alkaline`).
5. Splits the dataset evenly into `num_clients` slices.
6. Returns a dict with scaler, feature names, and per-client data.

#### `clean_for_json(obj)`

NumPy and pandas sometimes produce `NaN` or `Inf` values that cannot be serialised to JSON. This recursive helper replaces them with `None` before sending responses.

---

### 5.12 Sample Data — `seed_data.py`

Run this script once to populate the database with test data for development:

```bash
python seed_data.py
```

It creates:
- **1 admin user**: `admin@waterwatch.com` / `Admin@123`
- **3 portal users**: WU-2024-001, WU-2024-002, WU-2024-003
- **Synthetic sensor readings** for each portal user (generated with realistic random values)

---

### 5.13 Client Server — `client/server.py`

A second, separate FastAPI server that runs on port 5001. In a real deployment, this would run on each edge device or data centre. For demonstration, it runs locally and represents a *federated client* that:

- Holds local training data
- Receives global model weights from the admin server
- Trains locally and sends updated weights back

---

## 6. Frontend Deep-Dive

### 6.1 Application Entry — `main.jsx` & `App.jsx`

`main.jsx` is the **browser entry point**. It mounts the React tree into the `<div id="root">` in `index.html`:

```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>      {/* wraps everything with auth state */}
    <App />
  </AuthProvider>
);
```

`App.jsx` defines the **route table** — which URL path maps to which component:

```
/login              → LoginPage
/signup             → SignupPage

/                   → ProtectedRoute (admin) → Layout → Overview
/quality            → ProtectedRoute (admin) → Layout → WaterQuality
/anomalies          → ProtectedRoute (admin) → Layout → Anomalies
/analytics          → ProtectedRoute (admin) → Layout → Analytics
/federated          → ProtectedRoute (admin) → Layout → FederatedLearning
/users              → ProtectedRoute (admin) → Layout → Users
/settings           → ProtectedRoute (admin) → Layout → Settings

/user               → ProtectedRoute (user)  → UserLayout → UserDashboard
/user/analytics     → ProtectedRoute (user)  → UserLayout → UserAnalytics
/user/alerts        → ProtectedRoute (user)  → UserLayout → UserAlerts
/user/profile       → ProtectedRoute (user)  → UserLayout → UserProfile
```

---

### 6.2 Authentication Context — `context/AuthContext.jsx`

The `AuthContext` is a **React Context** — a way to share state globally without passing props through every component.

**What it stores:**
```js
{
  user: { id, email, full_name, role } | null,
  token: "eyJ...",
  isLoading: false
}
```

**What it provides (via `useAuth()` hook):**
- `login(email, password)` — calls `POST /api/auth/login`, stores tokens
- `loginAsUser(uniqueId)` — calls `POST /api/users/login`, stores tokens
- `logout()` — clears tokens from state + localStorage
- `refreshToken()` — calls `POST /api/auth/refresh` to get new access token
- `isAuthenticated` — `true` if a valid token exists
- `isAdmin` — `true` if `role === "admin"`

Tokens are persisted to `localStorage` so the user stays logged in after a page refresh.

---

### 6.3 Layouts — `Layout.jsx` & `UserLayout.jsx`

Both layout components provide the **persistent chrome** (navigation sidebar, top header) and render the current page's content via `<Outlet />` (a React Router concept that renders the matched child route).

```
┌─────────────────────────────────────────────────┐
│  Top Header (Logo, User info, Logout button)    │
├──────────────┬──────────────────────────────────┤
│              │                                   │
│   Sidebar    │   <Outlet />                      │
│  Navigation  │   (current page renders here)    │
│              │                                   │
└──────────────┴──────────────────────────────────┘
```

`Layout.jsx` is for **admin routes**; `UserLayout.jsx` is a simpler layout for the consumer portal.

---

### 6.4 Route Protection — `ProtectedRoute.jsx`

This component wraps pages that require authentication:

```jsx
function ProtectedRoute({ requiredRole }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/login" />;

  return <Outlet />;   // render the actual page
}
```

If someone navigates directly to `/users` without being logged in, they are immediately redirected to `/login`.

---

### 6.5 Pages Overview

| Page Component | Route | What it shows |
|---------------|-------|--------------|
| `Overview.jsx` | `/` | Master dashboard: KPI cards, area charts, water health index (0-100), safety distribution pie chart, anomaly alerts |
| `WaterQuality.jsx` | `/quality` | Detailed water quality standards, per-parameter trend charts |
| `Anomalies.jsx` | `/anomalies` | List of detected anomalies, alert history, severity breakdown |
| `Analytics/index.jsx` | `/analytics` | Advanced charts: pH trends, TDS over time, temperature distribution, cross-parameter correlation |
| `FederatedLearning.jsx` | `/federated` | Training status, round history, start/stop training controls |
| `Users.jsx` | `/users` | Admin CRUD table for portal users — create, edit, delete |
| `Settings.jsx` | `/settings` | Application configuration panel |
| `UserDashboard.jsx` | `/user` | Consumer's own water quality cards and chart |
| `UserAnalytics.jsx` | `/user/analytics` | Consumer's historical trends |
| `UserAlerts.jsx` | `/user/alerts` | Consumer's personal anomaly alerts |
| `UserProfile.jsx` | `/user/profile` | Consumer profile info |

---

### 6.6 API Service — `services/sensorService.js`

All HTTP calls to the backend are centralised here. Components import and call these functions rather than writing `fetch()` directly.

```js
export const getSensorReadings = async (uniqueId, limit = 100) => {
  const response = await fetch(`${API_URL}/api/sensors/readings/${uniqueId}?limit=${limit}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!response.ok) throw new Error('Failed to fetch readings');
  return response.json();
};
```

**Benefits of centralising API calls:**
- One place to update the base URL (e.g., when deploying to production)
- Consistent error handling
- Easy to add request/response interceptors (e.g., auto-refresh token on 401)

---

## 7. Database Schema Explained

### `admin_users` Table

Stores accounts for system administrators.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Auto-generated unique identifier |
| `email` | TEXT | Login username — must be unique |
| `password_hash` | TEXT | bcrypt hash of the password — never plain text |
| `full_name` | TEXT | Display name (optional) |
| `is_active` | BOOLEAN | `false` = account disabled |
| `created_at` | TIMESTAMPTZ | When the account was registered |
| `last_sign_in` | TIMESTAMPTZ | Updated on every successful login |

### `portal_users` Table

Stores accounts for water consumers (no password).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Internal UUID |
| `unique_id` | TEXT | Human-readable ID like `WU-2024-001` — used for login and IoT linking |
| `name` | TEXT | Consumer's full name |
| `email` | TEXT | Contact email (optional) |
| `phone` | TEXT | Contact number (optional) |
| `address` | TEXT | Physical address |
| `area` | TEXT | Geographic area (e.g., "Sector 14, Gurgaon") |
| `created_at` | TIMESTAMPTZ | Account creation time |

### `sensor_readings` Table

Every reading ever submitted by an IoT device.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique reading identifier |
| `user_id` | UUID | Foreign key → `portal_users.id` |
| `unique_id` | TEXT | Denormalised copy of the consumer's unique_id for fast lookups |
| `ph` | NUMERIC | pH level (0–14) |
| `pressure` | NUMERIC | Water pressure (bar) |
| `flow_rate` | NUMERIC | Flow rate (L/min) |
| `total_volume_passed` | NUMERIC | Cumulative volume (litres) |
| `temperature` | NUMERIC | Water temperature (°C) |
| `tds` | INTEGER | Total Dissolved Solids (ppm) |
| `dissolved_oxygen` | NUMERIC | Dissolved oxygen (mg/L) |
| `water_quality` | TEXT | `"Safe"` or `"Unsafe"` |
| `risk_level` | TEXT | `"Low"`, `"Medium"`, or `"High"` |
| `device_id` | TEXT | Identifier of the IoT hardware (e.g., `"ESP32-001"`) |
| `location` | TEXT | Physical location description |
| `timestamp` | TIMESTAMPTZ | When the reading was taken |
| `created_at` | TIMESTAMPTZ | When it was stored in the database |

---

## 8. Key Data Flows (Step-by-Step)

### 8.1 Admin Login Flow

```
1. User types email + password → clicks Login
2. Frontend: POST /api/auth/login  { email, password }
3. Backend (auth/routes.py):
   a. Query admin_users WHERE email = ?
   b. If not found → 401 Unauthorized
   c. bcrypt.verify(password, password_hash)
   d. If mismatch → 401 Unauthorized
   e. UPDATE last_sign_in timestamp
   f. Create access token (30 min) + refresh token (7 days)
   g. Return { access_token, refresh_token, user }
4. Frontend (AuthContext):
   a. Store tokens in localStorage
   b. Set user state: { id, email, role: "admin" }
   c. Navigate to "/" (admin dashboard)
```

### 8.2 Portal User Login Flow

```
1. User types unique_id (e.g., "WU-2024-001") → clicks Login
2. Frontend: POST /api/users/login  { unique_id }
3. Backend (routes/users.py):
   a. Query portal_users WHERE unique_id = ?
   b. If not found → 401 Unauthorized
   c. Create JWT with { sub: user.id, role: "user" }
   d. Return { access_token, user }
4. Frontend (AuthContext):
   a. Store token in localStorage
   b. Set user state: { id, unique_id, role: "user" }
   c. Navigate to "/user" (consumer dashboard)
```

### 8.3 IoT Sensor Reading Flow

```
1. ESP32 device runs, collects sensor measurements
2. Device: POST /api/sensors/readings
   {
     "unique_id": "WU-2024-001",
     "ph": 7.2, "tds": 342, "temperature": 24.5,
     "pressure": 2.5, "flow_rate": 65.3,
     "total_volume_passed": 1500.5,
     "device_id": "ESP32-001", "location": "Main Tank"
   }
3. Backend (routes/sensors.py):
   a. Look up WU-2024-001 in portal_users → get user.id
   b. Assess water quality → ("Safe", "Low")
   c. INSERT INTO sensor_readings (all fields + quality assessment)
   d. Return { success: true, water_quality: "Safe", risk_level: "Low" }
4. Device receives confirmation and optionally displays status on LCD
```

### 8.4 Dashboard Data Fetch Flow

```
1. Admin loads Overview page
2. Frontend: GET /api/sensors/dashboard/all-users
   (Authorization: Bearer <admin_token>)
3. Backend runs SQL:
   SELECT DISTINCT ON (unique_id) * FROM sensor_readings
   ORDER BY unique_id, timestamp DESC
4. Returns one row per portal user (their latest reading)
5. Frontend renders KPI cards, charts, anomaly alerts
```

### 8.5 Federated Learning Training Flow

```
1. Admin clicks "Start Training" (configures: rounds=5, clients=3, epochs=10)
2. Frontend: POST /api/training/start  { rounds, clients_count, local_epochs }
3. Backend (routes/training.py):
   a. Load CSV dataset (backend/data/*.csv)
   b. Split data into 3 equal parts (one per simulated client)
   c. Create 1 global model

   FOR each round (1 to 5):
     d. FOR each simulated client:
        - Make a local copy of the global model
        - Train on this client's data for 10 epochs
        - Record the trained weights
     e. FedAvg: average the weights from all clients
        new_global_weight = mean(client_1_weights, client_2_weights, client_3_weights)
     f. Update global model with averaged weights
     g. Evaluate global model on full dataset
     h. Record round metrics (accuracy, loss, precision, recall)
   
   i. Save final model to federated_water_quality_model.h5
4. Frontend polls GET /api/training/status every few seconds
5. Dashboard shows real-time progress bar and metrics
```

---

## 9. Water Quality Assessment Logic

The rule-based assessment (`assess_water_quality` in `routes/sensors.py`) compares sensor values against established safe ranges from water quality standards:

| Parameter | Safe Range | Why This Range |
|-----------|-----------|----------------|
| **pH** | 6.5 – 8.5 | WHO drinking water guideline; outside this range indicates acidic/alkaline contamination |
| **TDS** | < 500 ppm | WHO upper limit; higher values indicate dissolved salts/minerals/contaminants |
| **Temperature** | 10 – 35 °C | Too cold risks freezing; too hot promotes bacterial growth |

**Risk Level Calculation:**

```
0 parameters outside range → water_quality = "Safe",   risk_level = "Low"
1 parameter outside range  → water_quality = "Unsafe", risk_level = "Medium"
2+ parameters outside range → water_quality = "Unsafe", risk_level = "High"
```

**Water Health Index (0–100) on the dashboard** is calculated from these same values with a weighted formula, giving a single intuitive score visible on the Overview page.

---

## 10. Machine Learning Model Explained

### What the Model Predicts

Given a set of sensor readings, it outputs a probability (0–1) that the water is **unsafe**:
- < 0.5 → predicted safe
- ≥ 0.5 → predicted unsafe

### Architecture (4 hidden layers)

```
Layer         Neurons   Activation   Note
──────────────────────────────────────────────────────────────
Input         n         —            n = number of features
Dense         32        ReLU         + L2 regularisation (0.01)
Dropout       —         —            30% of neurons dropped during training
Dense         16        ReLU         + L2 regularisation (0.01)
Dropout       —         —            30% dropped
Dense         8         ReLU         + L2 regularisation (0.01)
Dropout       —         —            20% dropped
Dense         1         Sigmoid      Output: probability 0–1
```

**ReLU (Rectified Linear Unit):** `f(x) = max(0, x)` — fast to compute and avoids the vanishing gradient problem.

**Sigmoid:** `f(x) = 1 / (1 + e^-x)` — squashes output to 0–1, perfect for probabilities.

**Dropout:** During each training step, randomly sets some neuron outputs to zero. This forces the network to not rely on any single neuron and improves generalisation.

**L2 Regularisation:** Adds a penalty to the loss function proportional to the square of the weights. This prevents the weights from growing too large (overfitting).

### Feature Engineering

```python
numerical_cols = [
    'pressure_bar', 'flow_rate_L_min', 'total_volume_L',
    'tds_ppm', 'ph', 'temperature_C', 'signal_strength_dBm'
]
categorical_cols = [
    'pressure_status', 'tds_status', 'ph_status',
    'wifi_status', 'sensor_status'
]
```

Categorical values are one-hot encoded (e.g., `ph_status_Acidic = 1` if acidic, 0 otherwise).

All numerical values are standardised: `(value - mean) / std_dev`

### Pre-trained Model

The file `federated_water_quality_model.h5` is the result of previous federated training runs. It is loaded at server startup and used for `/api/model/predict` without needing to retrain.

---

## 11. Federated Learning Explained

### The Problem Federated Learning Solves

Traditional ML requires centralising all data on one server. For water management:
- Different households have private consumption data
- Sending personal water usage to a central server raises privacy concerns
- Network connectivity at edge locations may be unreliable

### How Federated Learning Works

```
Central Server (Admin Server)
│
│  1. Sends global model weights to all clients
│
├── Client 1 (e.g., water treatment zone A)
│     trains on local data → sends weight updates back
│
├── Client 2 (e.g., water treatment zone B)
│     trains on local data → sends weight updates back
│
└── Client 3 (e.g., water treatment zone C)
      trains on local data → sends weight updates back

2. Server averages all weight updates (FedAvg):
   new_global_weight[i] = sum(client_weight[i]) / num_clients

3. Global model is updated and the cycle repeats.
```

**Result:** The global model improves from all clients' data — *without any client ever sharing raw data*.

### FedAvg Algorithm (in code)

```python
# After all clients have trained locally:
avg_weights = []
for layer_idx in range(num_layers):
    layer_weights = [client_weights[c][layer_idx] for c in clients]
    avg_weights.append(np.mean(layer_weights, axis=0))

global_model.set_weights(avg_weights)
```

---

## 12. Docker & Deployment

### `docker-compose.yml` — Three Services

```yaml
services:
  db:         # PostgreSQL 15
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: wateradmin
      POSTGRES_PASSWORD: Water2024Secure
      POSTGRES_DB: water_management
    ports:
      - "5432:5432"

  backend:    # FastAPI application
    build: ./backend
    depends_on: [db]
    environment:
      DATABASE_URL: postgresql://wateradmin:...@db:5432/water_management
    ports:
      - "5111:5111"

  frontend:   # React app served by nginx
    build: ./Frontend
    depends_on: [backend]
    ports:
      - "5173:80"
```

### Frontend `Dockerfile` — Multi-Stage Build

```dockerfile
# Stage 1: Build the React app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build          # produces /app/dist

# Stage 2: Serve with nginx (tiny production image)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

Multi-stage builds mean the final image only contains nginx + the compiled static files — not Node.js or the source code. This makes it much smaller and more secure.

### Backend `Dockerfile`

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "admin/server.py"]
```

---

## 13. Environment Variables Reference

Create `backend/.env` by copying `backend/.env.example`:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://wateradmin:Water2024Secure@localhost:5432/water_management` | Full PostgreSQL connection string |
| `JWT_SECRET_KEY` | *(required)* | A long, random string used to sign JWT tokens. Never share this. |
| `JWT_ALGORITHM` | `HS256` | JWT signing algorithm |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | How long access tokens are valid |
| `JWT_REFRESH_TOKEN_EXPIRE_DAYS` | `7` | How long refresh tokens are valid |
| `SERVER_HOST` | `0.0.0.0` | IP to bind the server to (0.0.0.0 = all interfaces) |
| `SERVER_PORT` | `5111` | TCP port the backend listens on |
| `CORS_ALLOW_ORIGINS` | `http://localhost:5173,...` | Comma-separated list of allowed frontend origins |

---

## 14. How to Run Locally (Step-by-Step)

### Option A: Docker (Easiest)

```bash
# 1. Clone the repo
git clone <repository-url>
cd Smart-Water-Management-IS

# 2. Create environment file
cp backend/.env.example backend/.env
# Open backend/.env and set a strong JWT_SECRET_KEY

# 3. Start everything
docker-compose up -d

# 4. Seed the database with sample data
docker exec -it smart-water-admin python seed_data.py

# 5. Open the app
# Frontend:  http://localhost:5173
# API docs:  http://localhost:5111/docs
```

### Option B: Local Development

#### Terminal 1 — PostgreSQL

You need a running PostgreSQL 15 instance. Easiest with Docker:
```bash
docker run -d \
  --name water-db \
  -e POSTGRES_USER=wateradmin \
  -e POSTGRES_PASSWORD=Water2024Secure \
  -e POSTGRES_DB=water_management \
  -p 5432:5432 \
  postgres:15-alpine
```

#### Terminal 2 — Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env         # edit DATABASE_URL if needed
python seed_data.py           # populate test data
python admin/server.py        # starts on http://localhost:5111
```

#### Terminal 3 — Frontend

```bash
cd Frontend
npm install
npm run dev                   # starts on http://localhost:5173
```

### Verify It's Working

1. Open `http://localhost:5173` — you should see the login page.
2. Log in as admin: `admin@waterwatch.com` / `Admin@123`
3. Open `http://localhost:5111/docs` to browse the interactive API documentation.

---

## 15. Sample API Requests (curl / Postman)

### Admin Login

```bash
curl -X POST http://localhost:5111/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@waterwatch.com", "password": "Admin@123"}'
```

Response:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": { "id": "...", "email": "admin@waterwatch.com" }
}
```

### Submit an IoT Sensor Reading (no authentication required — called by devices)

```bash
curl -X POST http://localhost:5111/api/sensors/readings \
  -H "Content-Type: application/json" \
  -d '{
    "unique_id": "WU-2024-001",
    "ph": 7.2,
    "pressure": 2.5,
    "flow_rate": 65.3,
    "total_volume_passed": 1500.5,
    "temperature": 24.5,
    "tds": 342,
    "dissolved_oxygen": 7.5,
    "device_id": "ESP32-001",
    "location": "Main Tank"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Sensor reading stored successfully",
  "reading_id": "uuid-...",
  "timestamp": "2024-01-15T10:30:00",
  "water_quality": "Safe",
  "risk_level": "Low"
}
```

### Get Latest Reading (requires admin token)

```bash
curl http://localhost:5111/api/sensors/readings/WU-2024-001/latest \
  -H "Authorization: Bearer <access_token>"
```

### Start Federated Training

```bash
curl -X POST http://localhost:5111/api/training/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"rounds": 5, "clients_count": 3, "local_epochs": 10}'
```

---

## 16. Glossary of Terms

| Term | Meaning |
|------|---------|
| **FastAPI** | A modern Python web framework that automatically generates API documentation and validates request/response data |
| **Pydantic** | A Python library that uses type annotations to validate data |
| **JWT (JSON Web Token)** | A compact, URL-safe token that encodes user identity. Signed with a secret key so it cannot be tampered with |
| **CORS** | Cross-Origin Resource Sharing — a browser mechanism that controls which domains can call an API |
| **asyncpg** | An asynchronous PostgreSQL driver for Python, allowing non-blocking database queries |
| **Connection Pool** | A cache of reusable database connections to avoid the overhead of creating a new connection per request |
| **UUID** | Universally Unique Identifier — a 128-bit random ID used as a primary key |
| **Bcrypt** | A password hashing algorithm designed to be slow, making brute-force attacks impractical |
| **pH** | A scale 0–14 measuring acidity/alkalinity of water (7 = neutral) |
| **TDS** | Total Dissolved Solids — measures the concentration of dissolved minerals, salts, and metals in ppm |
| **ppm** | Parts per million — unit of concentration |
| **FedAvg** | Federated Averaging — the algorithm that averages client model weights to update the global model |
| **Federated Learning** | Training ML models across multiple decentralised clients without sharing raw data |
| **Neural Network** | A machine learning model inspired by the brain, made of layers of interconnected nodes (neurons) |
| **ReLU** | Rectified Linear Unit — an activation function: `f(x) = max(0, x)` |
| **Sigmoid** | An activation function that outputs values between 0 and 1 — used for binary classification |
| **Dropout** | A regularisation technique that randomly deactivates neurons during training to prevent overfitting |
| **L2 Regularisation** | Adds a penalty to large weights during training, preventing overfitting |
| **StandardScaler** | Transforms features to have mean=0 and std=1 — required before feeding data to neural networks |
| **One-hot Encoding** | Converts categorical values (e.g., "High", "Low") into binary columns |
| **Docker** | A tool for packaging applications with all their dependencies into portable containers |
| **Docker Compose** | Defines and runs multi-container Docker applications |
| **Vite** | A next-generation build tool for JavaScript — extremely fast HMR (Hot Module Replacement) |
| **React Context** | A React mechanism for sharing state globally without passing it through props at every level |
| **Protected Route** | A frontend component that redirects unauthenticated users to the login page |
| **IoT** | Internet of Things — physical devices (sensors, microcontrollers) connected to the internet |
| **ESP32** | A popular low-cost microcontroller with built-in WiFi, commonly used for IoT sensor projects |
