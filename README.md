# Smart Water Management System

A comprehensive intelligent water management system using federated machine learning to monitor water quality, detect anomalies, and provide real-time insights through an interactive dashboard.

## Features

- 📊 **Real-time Dashboard** - Live monitoring of water quality metrics
- 🎯 **Water Health Index** - Comprehensive health scoring system (0-100)
- 📈 **Advanced Analytics** - Interactive charts for pH, TDS, temperature, flow rate, and dissolved oxygen
- ⚠️ **Anomaly Detection** - Real-time alerts for water quality issues
- 🤖 **AI-Powered Predictions** - Machine learning model for water quality classification
- 🔄 **Federated Learning** - Distributed training across multiple client devices
- 🔐 **Authentication** - JWT-based auth with admin and portal user roles
- 📱 **Responsive Design** - Works seamlessly on PC, laptop, tablet, and mobile
- 🌐 **IoT Integration** - API endpoints for IoT sensor data submission

## Tech Stack

### Frontend
- **React 19** + **Vite** - Modern build tooling
- **Tailwind CSS 4** - Utility-first styling
- **Recharts** - Data visualization
- **Lucide React** - Icon library

### Backend
- **FastAPI** - High-performance Python API framework
- **PostgreSQL 15** - Relational database
- **asyncpg** - Async PostgreSQL driver
- **TensorFlow/Keras** - Machine learning
- **JWT** - Authentication tokens

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js v18+ (for local development)
- Python 3.10+ (for local development)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd Smart-Water-Management-IS
```

### 2. Configure Environment

```bash
# Copy example env file
cp backend/.env.example backend/.env

# Edit with your settings (or use defaults)
```

### 3. Start with Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Seed Sample Data

```bash
# Run the seed script to create sample users and data
docker exec -it smart-water-admin python seed_data.py
```

Or if running locally:
```bash
cd backend
python seed_data.py
```

---

## 🔐 Sample Login Credentials

After running the seed script, you can login with these credentials:

### Admin User
| Field | Value |
|-------|-------|
| **Email** | `admin@waterwatch.com` |
| **Password** | `Admin@123` |
| **Role** | Administrator (full access) |

### Portal Users (Water Consumers)
Login using **Unique ID only** (no password required):

| Unique ID | Name | Area |
|-----------|------|------|
| `WU-2024-001` | Rajesh Kumar | Sector 14, Gurgaon |
| `WU-2024-002` | Priya Sharma | Connaught Place, New Delhi |
| `WU-2024-003` | Amit Patel | Bandra West, Mumbai |

---

## API Endpoints

### Base URL
- **Local**: `http://localhost:5111`
- **Docker**: `http://localhost:5111`

### Authentication
```
POST /api/auth/register     - Register new admin
POST /api/auth/login        - Admin login (email/password)
POST /api/auth/refresh      - Refresh access token
POST /api/auth/logout       - Logout
GET  /api/auth/me           - Get current user
PUT  /api/auth/profile      - Update profile
```

### Portal Users
```
POST /api/users/login       - Portal user login (unique_id only)
POST /api/users/register    - Admin creates portal user
GET  /api/users             - List all portal users
GET  /api/users/{id}        - Get user by ID
PUT  /api/users/{id}        - Update user
DELETE /api/users/{id}      - Delete user
```

### Sensor Readings (IoT Integration)
```
POST /api/sensors/readings                    - Submit sensor reading
GET  /api/sensors/readings/{unique_id}        - Get user's readings
GET  /api/sensors/readings/{unique_id}/latest - Get latest reading
GET  /api/sensors/readings/{unique_id}/statistics - Get statistics
GET  /api/sensors/readings/{unique_id}/range  - Get readings by date range
GET  /api/sensors/dashboard/all-users         - Admin: all users' latest data
```

### IoT Device Payload Example
```json
POST /api/sensors/readings
{
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
}
```

### Model & Training
```
GET  /api/model/info        - Model information
GET  /api/model/download    - Download trained model
POST /api/model/predict     - Make water quality prediction

GET  /api/training/status   - Training status
GET  /api/training/history  - Training history
POST /api/training/start    - Start federated training
POST /api/training/stop     - Stop training
```

---

## Project Structure

```
Smart-Water-Management-IS/
├── Frontend/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── pages/           # Page components
│   │   │   │   ├── Analytics/   # Analytics dashboard
│   │   │   │   ├── Anomalies.jsx
│   │   │   │   ├── Overview.jsx
│   │   │   │   └── ...
│   │   │   └── ui/              # Reusable UI components
│   │   ├── context/             # React context (Auth)
│   │   ├── services/            # API services
│   │   ├── hooks/               # Custom hooks
│   │   └── data/                # Data utilities
│   └── Dockerfile
│
├── backend/                     # Python backend
│   ├── admin/                   # Admin server
│   │   └── server.py            # Main FastAPI app
│   ├── client/                  # Client server (federated)
│   │   └── server.py
│   ├── auth/                    # Authentication
│   │   ├── routes.py
│   │   ├── database.py
│   │   └── jwt_handler.py
│   ├── routes/                  # API routes
│   │   ├── sensors.py           # IoT sensor endpoints
│   │   ├── users.py
│   │   ├── clients.py
│   │   ├── data.py
│   │   ├── model.py
│   │   └── training.py
│   ├── core/                    # ML model
│   ├── data/                    # Training data
│   ├── seed_data.py             # Sample data generator
│   └── Dockerfile
│
├── docker-compose.yml           # Container orchestration
└── README.md
```

---

## Database Schema

### Tables

1. **admin_users** - Administrator accounts
   - Email/password authentication
   - Full system access

2. **portal_users** - Water consumers
   - Unique ID login (no password)
   - Limited access to own data

3. **sensor_readings** - IoT sensor data
   - Linked to portal_users
   - Stores pH, TDS, temperature, flow rate, etc.
   - Water quality predictions

---

## Development

### Frontend (Local)
```bash
cd Frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Backend (Local)
```bash
cd backend
pip install -r requirements.txt

# Start admin server
python admin/server.py
# Runs on http://localhost:5111
```

### Environment Variables

Create `backend/.env`:
```env
DATABASE_URL=postgresql://wateradmin:Water2024Secure@localhost:5432/water_management
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
SERVER_HOST=0.0.0.0
SERVER_PORT=5111
```

---

## Deployment

### Docker Compose (Recommended)
```bash
docker-compose up -d --build
```

### Services
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5111
- **PostgreSQL**: localhost:5432

---

## Contributing

This is a project for Smart Water Management IS. For contributions or questions, please contact the development team.

## License

This project is part of an academic/research initiative.
