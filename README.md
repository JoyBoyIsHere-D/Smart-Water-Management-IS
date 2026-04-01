# Smart Water Management IS

Smart Water Management IS is a full-stack platform for water quality monitoring, anomaly tracking, user management, and federated model operations.

It includes:
- Admin dashboard for system-wide monitoring and control.
- Portal-user dashboard for individual usage, alerts, and profile access.
- FastAPI backend with PostgreSQL, JWT auth, sensor APIs, and federated learning endpoints.
- Dockerized deployment for frontend, admin backend, client backend, and database.

## Implemented Features

### Admin Dashboard
- Master overview and per-user dashboard view switch.
- KPI cards for health index, consumption, anomaly counts, and sensor trends.
- Water quality page with charting and standards comparison.
- Anomaly management page with severity filters and acknowledge actions.
- Analytics workspace with:
   - Time range and granularity controls.
   - Metric selection controls.
   - Trend, comparative, statistical, anomaly, and consumption analytics panels.
   - CSV export.
   - PDF report export (implemented via jsPDF).
- Federated Learning control center:
   - Register/remove clients.
   - Client health checks.
   - Fetch aggregated client data and metrics.
   - Start/stop federated training rounds.
   - View training status and round history.
   - View model information and download model file.
   - Run prediction from manual input payload.
- User management for portal users:
   - Create, edit, activate/deactivate, search/filter/sort, and delete users.
- Settings UI for profile, notifications, thresholds, data management, and appearance.

### Portal User Experience
- Dedicated login using unique ID only.
- User dashboard with personalized KPIs, charts, and anomaly snapshot.
- User analytics page with trend and usage visualizations.
- User alerts page for notification feed.
- User profile page for account information.

### Backend and API
- JWT-based admin authentication with register/login/refresh/logout/profile/update/password flows.
- Portal-user auth flow using unique ID and token issuance.
- Sensor ingestion and retrieval APIs:
   - Submit readings.
   - Latest, history, date-range, and statistics retrieval.
   - Dashboard endpoint for all users.
- Federated modules:
   - Client registry and health checks.
   - Distributed data/metrics aggregation.
   - Federated training status/history/start/stop.
   - Model info/download/predict.
- PostgreSQL-backed persistence for admin users, portal users, and sensor readings.

### Data and Research Assets
- Seed script for demo users and sample sensor records.
- Synthetic datasets under backend/data.
- Notebook assets for modeling and federated learning experimentation:
   - Data_Model.ipynb
   - federated_learning.ipynb

## Tech Stack

### Frontend
- React 19
- Vite 7
- Tailwind CSS 4
- Recharts
- Lucide React
- jsPDF

### Backend
- FastAPI
- asyncpg
- PostgreSQL 15
- python-jose + passlib (JWT and password hashing)
- TensorFlow / Keras (with simulated fallback behavior in some flows if unavailable)
- pandas, numpy, scikit-learn

### Infrastructure
- Docker + Docker Compose

## Repository Structure

```text
Smart-Water-Management-IS/
|-- Frontend/
|   |-- src/
|   |   |-- components/
|   |   |   |-- pages/
|   |   |   |-- ui/
|   |   |-- context/
|   |   |-- config/
|   |   |-- data/
|   |   |-- hooks/
|   |   |-- services/
|-- backend/
|   |-- admin/
|   |-- client/
|   |-- auth/
|   |-- routes/
|   |-- core/
|   |-- data/
|   |-- seed_data.py
|-- docker-compose.yml
|-- Data_Model.ipynb
|-- federated_learning.ipynb
|-- README.md
```

## Prerequisites

- Docker and Docker Compose (recommended path)
- For local non-Docker development:
   - Node.js 18+
   - Python 3.11+
   - PostgreSQL 15+

## Environment Setup

### Backend env

Create backend/.env from backend/.env.example.

PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Bash:

```bash
cp backend/.env.example backend/.env
```

Important backend variables:
- DATABASE_URL
- JWT_SECRET_KEY
- SERVER_HOST (default 0.0.0.0)
- SERVER_PORT (default 5000)
- CORS_ALLOW_ORIGINS
- CLIENT_HOST and CLIENT_PORT (client server)

### Frontend env

Frontend/.env.example sets VITE_API_URL=http://localhost:5000.

If you change VITE_API_URL for production, rebuild the frontend image/bundle.

## Run Commands

### Option A: Docker (recommended)

From repository root:

```bash
docker compose up --build -d
```

Useful commands:

```bash
docker compose ps
docker compose logs -f backend-admin
docker compose logs -f frontend
docker compose down
```

Services and ports (default):
- Frontend: http://localhost:3000
- Admin API: http://localhost:5000
- Client API: http://localhost:5001
- PostgreSQL: localhost:5432

Seed data is already executed by backend startup command, but you can rerun it manually:

```bash
docker compose exec backend-admin python seed_data.py
```

### Option B: Local development

#### 1) Backend admin server

```bash
cd backend
python -m venv .venv
```

Activate environment:

PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Bash:

```bash
source .venv/bin/activate
```

Install dependencies and run:

```bash
pip install -r requirements.txt
python seed_data.py
python admin/server.py
```

#### 2) Backend client server (new terminal)

```bash
cd backend
python client/server.py
```

#### 3) Frontend (new terminal)

```bash
cd Frontend
npm install
npm run dev
```

Local dev URLs:
- Frontend Vite: http://localhost:5173
- Admin API: http://localhost:5000
- Client API: http://localhost:5001

## Seeded Demo Credentials

The seed script creates these demo identities:

### Admin login
- Email: admin@waterwatch.com
- Password: Admin@123

### Portal user login (unique ID only)
- WU-2024-001
- WU-2024-002
- WU-2024-003

## API Summary

Main route groups:
- /api/auth: register, login, refresh, logout, profile, verify, password actions, health
- /api/users: portal-user login and admin CRUD for portal users
- /api/sensors: reading ingestion, latest/history/range/statistics, dashboard aggregation
- /api/clients: federated client registry and health checks
- /api/all-clients-data and /api/all-clients-metrics: distributed data and metric collection
- /api/training: status, history, start, stop
- /api/model: info, download, predict
- /api/health: admin server health check

Interactive docs are available at:
- http://localhost:5000/docs

## Testing Directions

This repository currently does not include a committed automated unit/integration test suite.

Recommended verification flow is static checks + API smoke tests + UI/E2E checks.

### 1) Frontend static checks

```bash
cd Frontend
npm run lint
npm run build
```

### 2) Backend API smoke checks

Run these after services are up:

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/auth/health
curl http://localhost:5000/api/sensors/health
curl http://localhost:5001/api/health
```

Optional sensor ingestion smoke test:

```bash
curl -X POST http://localhost:5000/api/sensors/readings \
   -H "Content-Type: application/json" \
   -d '{
      "unique_id": "WU-2024-001",
      "ph": 7.2,
      "pressure": 2.4,
      "flow_rate": 62.3,
      "total_volume_passed": 1450.2,
      "temperature": 24.1,
      "tds": 320,
      "dissolved_oxygen": 7.1,
      "device_id": "ESP32-001",
      "location": "Main Tank"
   }'
```

Then verify:

```bash
curl http://localhost:5000/api/sensors/readings/WU-2024-001/latest
```

### 3) Manual UI test checklist

1. Sign in as admin and verify admin routes load.
2. Open Analytics and confirm CSV and PDF report downloads work.
3. Open Federated Learning and verify client add/remove and health checks.
4. Start and stop a training round from the Training tab.
5. Run a model prediction from the Model tab.
6. Sign in as portal user and verify dashboard, analytics, alerts, and profile views.

## Notes

- The frontend DataUploadPage component exists, but its route is currently disabled in app routing.
- For Docker, use docker compose (space) commands.

## License

This project is part of an academic/research initiative.
