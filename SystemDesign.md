# 🌊 Smart Water Management System - System Design Document

## 📋 Table of Contents
- [Project Architecture Overview](#project-architecture-overview)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Machine Learning Pipeline](#machine-learning-pipeline)
- [Deployment Architecture](#deployment-architecture)
- [Development Workflow](#development-workflow)
- [Data Flow](#data-flow)
- [Security Considerations](#security-considerations)
- [Monitoring & Logging](#monitoring--logging)

---

## 📋 Project Architecture Overview

```
Smart-Water-Management-IS/
├── Frontend/                    # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   └── context/
│   └── package.json
│
├── Backend/                     # Python + FastAPI
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   ├── ml/
│   │   └── utils/
│   ├── tests/
│   └── requirements.txt
│
├── ML/                          # Machine Learning Models
│   ├── models/
│   ├── notebooks/
│   ├── data/
│   └── scripts/
│
└── docker-compose.yml           # Container orchestration
```

---

## 🎨 FRONTEND ARCHITECTURE

### **Tech Stack**
- **Framework**: React 19 + Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **State Management**: React Context API / Zustand
- **HTTP Client**: Axios
- **WebSocket**: Socket.io-client (real-time)
- **Form Validation**: React Hook Form + Zod
- **Date Handling**: date-fns
- **Notifications**: React Hot Toast

### **Folder Structure**

```
Frontend/src/
├── components/
│   ├── Layout.jsx                 # Main layout wrapper
│   ├── pages/
│   │   ├── Overview.jsx           # ✅ Dashboard overview
│   │   ├── WaterQuality.jsx       # ✅ Quality metrics & standards
│   │   ├── Anomalies.jsx          # ✅ Anomaly management
│   │   ├── Analytics/             # ✅ Advanced analytics
│   │   │   ├── index.jsx
│   │   │   ├── TimeRangeSelector.jsx
│   │   │   ├── KPICards.jsx
│   │   │   ├── TrendAnalysis.jsx
│   │   │   ├── ComparativeAnalysis.jsx
│   │   │   ├── StatisticalCharts.jsx
│   │   │   ├── AnomalyInsights.jsx
│   │   │   └── ConsumptionAnalytics.jsx
│   │   ├── DataUploadPage.jsx     # ✅ File upload interface
│   │   ├── Settings.jsx           # ✅ User settings
│   │   ├── SensorManagement.jsx   # 🔲 Sensor CRUD operations
│   │   ├── AlertsManagement.jsx   # 🔲 Configure alerts & thresholds
│   │   ├── Reports.jsx            # 🔲 Report generation & history
│   │   ├── MapView.jsx            # 🔲 Geographic sensor visualization
│   │   ├── Predictions.jsx        # 🔲 ML predictions dashboard
│   │   └── UserManagement.jsx     # 🔲 Admin user management
│   │
│   └── ui/                        # ✅ Reusable components
│       ├── Sidebar.jsx
│       ├── Header.jsx
│       ├── HealthIndexCard.jsx
│       ├── MetricCard.jsx
│       ├── SensorChart.jsx
│       ├── QualityPieChart.jsx
│       ├── FlowDistributionChart.jsx
│       ├── AnomalyAlerts.jsx
│       ├── DataUpload.jsx
│       ├── MetricsGrid.jsx
│       ├── Modal.jsx              # 🔲 Reusable modal
│       ├── Table.jsx              # 🔲 Data table component
│       ├── Loader.jsx             # 🔲 Loading states
│       └── NotificationCenter.jsx # 🔲 Notification dropdown
│
├── hooks/
│   ├── useSensorData.js           # 🔲 Fetch sensor data
│   ├── useWebSocket.js            # 🔲 Real-time WebSocket connection
│   ├── useAuth.js                 # 🔲 Authentication hook
│   ├── useAlerts.js               # 🔲 Alert management
│   └── useLocalStorage.js         # 🔲 Local storage utility
│
├── services/
│   ├── api.js                     # 🔲 Axios instance & interceptors
│   ├── sensorService.js           # 🔲 Sensor API calls
│   ├── authService.js             # 🔲 Authentication API
│   ├── uploadService.js           # 🔲 File upload API
│   ├── analyticsService.js        # 🔲 Analytics API
│   └── mlService.js               # 🔲 ML predictions API
│
├── context/
│   ├── AuthContext.jsx            # 🔲 User authentication state
│   ├── ThemeContext.jsx           # 🔲 Theme preferences
│   └── NotificationContext.jsx    # 🔲 Global notifications
│
├── utils/
│   ├── constants.js               # 🔲 App constants
│   ├── validators.js              # 🔲 Form validation rules
│   ├── formatters.js              # 🔲 Data formatters
│   ├── calculations.js            # 🔲 Health index, etc.
│   └── exportHelpers.js           # 🔲 CSV/PDF export
│
├── App.jsx                        # ✅ Route definitions
├── main.jsx                       # ✅ App entry point
└── index.css                      # ✅ Global styles
```

### **Pages & Routes**

| Route | Component | Status | Features |
|-------|-----------|--------|----------|
| `/` | Overview | ✅ Completed | Dashboard, KPIs, Live metrics |
| `/quality` | WaterQuality | ✅ Completed | Quality metrics, WHO/EPA standards |
| `/anomalies` | Anomalies | ✅ Completed | Alert history, severity levels, acknowledgment |
| `/analytics` | Analytics | ✅ Completed | Trends, comparisons, statistics, insights |
| `/upload` | DataUploadPage | ✅ Completed | CSV/JSON/XLSX upload with drag & drop |
| `/settings` | Settings | ✅ Completed | User preferences, thresholds, notifications |
| `/sensors` | SensorManagement | 🔲 Planned | Add/edit/delete sensors, calibration |
| `/alerts` | AlertsManagement | 🔲 Planned | Configure thresholds, notification rules |
| `/reports` | Reports | 🔲 Planned | Generate & download reports |
| `/map` | MapView | 🔲 Planned | Geographic visualization with clusters |
| `/predictions` | Predictions | 🔲 Planned | ML forecasts, confidence intervals |
| `/users` | UserManagement | 🔲 Planned | Admin panel, role management |

### **Component Hierarchy**

```
App (React Router)
└── Layout
    ├── Sidebar (Navigation)
    ├── Header (Search, Notifications, User Menu)
    └── Outlet (Page Content)
        ├── Overview
        │   ├── HealthIndexCard
        │   ├── MetricCard (×4)
        │   ├── SensorChart
        │   ├── QualityPieChart
        │   ├── FlowDistributionChart
        │   ├── AnomalyAlerts
        │   ├── DataUpload
        │   └── MetricsGrid
        ├── WaterQuality
        │   ├── Quality Metrics Grid
        │   ├── SensorChart
        │   ├── QualityPieChart
        │   └── Standards Table
        ├── Anomalies
        │   ├── Stats Cards
        │   ├── Filter Controls
        │   └── Anomaly List
        ├── Analytics
        │   ├── TimeRangeSelector
        │   ├── KPICards
        │   ├── TrendAnalysis
        │   ├── ComparativeAnalysis
        │   ├── StatisticalCharts
        │   ├── AnomalyInsights
        │   └── ConsumptionAnalytics
        ├── DataUploadPage
        │   ├── Upload Zone
        │   ├── Current Uploads
        │   └── Upload History
        └── Settings
            ├── Settings Navigation
            └── Settings Content
```

---

## 🔧 BACKEND ARCHITECTURE

### **Tech Stack**
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0
- **Authentication**: JWT (PyJWT)
- **Task Queue**: Celery + Redis
- **WebSocket**: FastAPI WebSocket
- **ML Framework**: Scikit-learn, TensorFlow/PyTorch
- **Data Processing**: Pandas, NumPy
- **API Documentation**: OpenAPI (Swagger)
- **Testing**: pytest
- **Deployment**: Docker + Gunicorn/Uvicorn

### **Folder Structure**

```
Backend/
├── app/
│   ├── main.py                    # FastAPI app initialization
│   ├── config.py                  # Environment variables
│   ├── database.py                # Database connection
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py            # 🔲 Login, register, JWT
│   │   │   ├── sensors.py         # 🔲 Sensor CRUD operations
│   │   │   ├── readings.py        # 🔲 Sensor readings ingestion
│   │   │   ├── analytics.py       # 🔲 Analytics endpoints
│   │   │   ├── anomalies.py       # 🔲 Anomaly detection
│   │   │   ├── predictions.py     # 🔲 ML predictions
│   │   │   ├── alerts.py          # 🔲 Alert management
│   │   │   ├── reports.py         # 🔲 Report generation
│   │   │   ├── upload.py          # 🔲 File upload handling
│   │   │   └── websocket.py       # 🔲 Real-time data streaming
│   │   │
│   │   └── deps.py                # 🔲 Dependency injection (auth, db)
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py                # 🔲 User model
│   │   ├── sensor.py              # 🔲 Sensor model
│   │   ├── reading.py             # 🔲 Sensor reading model
│   │   ├── anomaly.py             # 🔲 Anomaly model
│   │   ├── alert.py               # 🔲 Alert configuration model
│   │   └── report.py              # 🔲 Report model
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py                # 🔲 Pydantic schemas
│   │   ├── sensor.py
│   │   ├── reading.py
│   │   ├── anomaly.py
│   │   └── alert.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py        # 🔲 Authentication logic
│   │   ├── sensor_service.py      # 🔲 Sensor business logic
│   │   ├── analytics_service.py   # 🔲 Analytics calculations
│   │   ├── anomaly_service.py     # 🔲 Anomaly detection service
│   │   ├── prediction_service.py  # 🔲 ML prediction service
│   │   ├── alert_service.py       # 🔲 Alert notification logic
│   │   ├── report_service.py      # 🔲 Report generation
│   │   └── upload_service.py      # 🔲 File parsing & validation
│   │
│   ├── ml/
│   │   ├── __init__.py
│   │   ├── models/                # 🔲 Trained ML models (.pkl, .h5)
│   │   ├── preprocessor.py        # 🔲 Data preprocessing
│   │   ├── feature_engineering.py # 🔲 Feature extraction
│   │   ├── anomaly_detector.py    # 🔲 Anomaly detection ML
│   │   ├── quality_classifier.py  # 🔲 Water quality classification
│   │   └── predictor.py           # 🔲 Time series forecasting
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── validators.py          # 🔲 Data validation utilities
│   │   ├── calculations.py        # 🔲 Health index, statistics
│   │   ├── logger.py              # 🔲 Logging configuration
│   │   └── helpers.py             # 🔲 Helper functions
│   │
│   └── tasks/
│       ├── __init__.py
│       ├── celery_app.py          # 🔲 Celery configuration
│       ├── data_ingestion.py      # 🔲 Background data processing
│       ├── model_training.py      # 🔲 Scheduled model retraining
│       └── alert_notifications.py # 🔲 Email/SMS alerts
│
├── tests/
│   ├── __init__.py
│   ├── test_api/
│   │   ├── test_auth.py
│   │   ├── test_sensors.py
│   │   ├── test_readings.py
│   │   └── test_analytics.py
│   ├── test_services/
│   │   ├── test_sensor_service.py
│   │   └── test_analytics_service.py
│   └── test_ml/
│       ├── test_anomaly_detector.py
│       └── test_quality_classifier.py
│
├── alembic/                       # 🔲 Database migrations
│   ├── versions/
│   │   └── 001_initial_schema.py
│   ├── env.py
│   └── alembic.ini
│
├── requirements.txt
├── requirements-dev.txt
├── Dockerfile
├── .env.example
└── pytest.ini
```

### **Main Application File (main.py)**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, sensors, readings, analytics, anomalies
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Water Management API",
    version="1.0.0",
    description="API for water quality monitoring and management"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(sensors.router, prefix="/api/v1/sensors", tags=["Sensors"])
app.include_router(readings.router, prefix="/api/v1/readings", tags=["Readings"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(anomalies.router, prefix="/api/v1/anomalies", tags=["Anomalies"])

@app.get("/")
def read_root():
    return {"message": "Smart Water Management API"}
```

---

## 🗄️ DATABASE SCHEMA

### **PostgreSQL Tables**

#### **Users Table**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user', -- admin, user, viewer
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### **Sensors Table**
```sql
CREATE TABLE sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    type VARCHAR(50), -- pH, turbidity, TDS, temperature, flow
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, maintenance
    last_calibration TIMESTAMP,
    calibration_interval_days INTEGER DEFAULT 90,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sensors_status ON sensors(status);
CREATE INDEX idx_sensors_location ON sensors(location);
```

#### **Sensor Readings Table (Time-series data)**
```sql
CREATE TABLE sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    ph DECIMAL(4, 2),
    turbidity DECIMAL(6, 2),
    tds INTEGER,
    temperature DECIMAL(4, 1),
    flow_rate DECIMAL(6, 2),
    dissolved_oxygen DECIMAL(4, 2),
    conductivity DECIMAL(8, 2),
    chlorine DECIMAL(4, 2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sensor_timestamp ON sensor_readings(sensor_id, timestamp DESC);
CREATE INDEX idx_readings_timestamp ON sensor_readings(timestamp DESC);
```

#### **Anomalies Table**
```sql
CREATE TABLE anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reading_id BIGINT REFERENCES sensor_readings(id),
    sensor_id UUID REFERENCES sensors(id),
    anomaly_type VARCHAR(50), -- spike, drop, out_of_range, pattern
    severity VARCHAR(20), -- low, medium, high, critical
    metric VARCHAR(50), -- ph, turbidity, tds, etc.
    value DECIMAL(10, 2),
    expected_value DECIMAL(10, 2),
    confidence_score DECIMAL(3, 2),
    description TEXT,
    status VARCHAR(20) DEFAULT 'open', -- open, acknowledged, resolved
    detected_at TIMESTAMP NOT NULL,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_anomalies_sensor ON anomalies(sensor_id);
CREATE INDEX idx_anomalies_status ON anomalies(status);
CREATE INDEX idx_anomalies_severity ON anomalies(severity);
CREATE INDEX idx_anomalies_detected_at ON anomalies(detected_at DESC);
```

#### **Alert Configurations Table**
```sql
CREATE TABLE alert_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    metric VARCHAR(50) NOT NULL,
    min_threshold DECIMAL(10, 2),
    max_threshold DECIMAL(10, 2),
    severity VARCHAR(20),
    notification_method VARCHAR(50), -- email, sms, push, webhook
    webhook_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alert_configs_user ON alert_configurations(user_id);
CREATE INDEX idx_alert_configs_active ON alert_configurations(is_active);
```

#### **Alert History Table**
```sql
CREATE TABLE alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_config_id UUID REFERENCES alert_configurations(id),
    anomaly_id UUID REFERENCES anomalies(id),
    notification_method VARCHAR(50),
    status VARCHAR(20), -- sent, failed, pending
    sent_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alert_history_config ON alert_history(alert_config_id);
CREATE INDEX idx_alert_history_sent_at ON alert_history(sent_at DESC);
```

#### **Reports Table**
```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    report_type VARCHAR(50), -- daily, weekly, monthly, custom
    title VARCHAR(255),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    file_path VARCHAR(500),
    file_format VARCHAR(10), -- pdf, csv, xlsx
    file_size_bytes BIGINT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_reports_user ON reports(user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
```

#### **Water Quality Predictions Table**
```sql
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID REFERENCES sensors(id),
    predicted_at TIMESTAMP DEFAULT NOW(),
    prediction_time TIMESTAMP NOT NULL,
    metric VARCHAR(50),
    predicted_value DECIMAL(10, 2),
    confidence_interval_low DECIMAL(10, 2),
    confidence_interval_high DECIMAL(10, 2),
    model_version VARCHAR(50),
    model_accuracy DECIMAL(5, 4),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_predictions_sensor ON predictions(sensor_id);
CREATE INDEX idx_predictions_time ON predictions(prediction_time);
CREATE INDEX idx_predictions_metric ON predictions(metric);
```

#### **System Logs Table**
```sql
CREATE TABLE system_logs (
    id BIGSERIAL PRIMARY KEY,
    level VARCHAR(20), -- INFO, WARNING, ERROR, CRITICAL
    source VARCHAR(100), -- api, ml, celery, etc.
    message TEXT,
    details JSONB,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_logs_level ON system_logs(level);
CREATE INDEX idx_logs_source ON system_logs(source);
CREATE INDEX idx_logs_created_at ON system_logs(created_at DESC);
```

### **Database Relationships**

```
users (1) ----< (M) alert_configurations
users (1) ----< (M) reports
users (1) ----< (M) anomalies (acknowledged_by)

sensors (1) ----< (M) sensor_readings
sensors (1) ----< (M) anomalies
sensors (1) ----< (M) predictions

sensor_readings (1) ----< (1) anomalies

anomalies (1) ----< (M) alert_history

alert_configurations (1) ----< (M) alert_history
```

---

## 🔗 API ENDPOINTS

### **Authentication Endpoints**
```
POST   /api/v1/auth/register          # Register new user
POST   /api/v1/auth/login             # Login & get JWT token
POST   /api/v1/auth/refresh           # Refresh access token
POST   /api/v1/auth/logout            # Logout
GET    /api/v1/auth/me                # Get current user info
PUT    /api/v1/auth/me                # Update user profile
PUT    /api/v1/auth/password          # Change password
POST   /api/v1/auth/forgot-password   # Request password reset
POST   /api/v1/auth/reset-password    # Reset password with token
```

### **Sensor Endpoints**
```
GET    /api/v1/sensors                       # List all sensors
POST   /api/v1/sensors                       # Create new sensor
GET    /api/v1/sensors/{id}                  # Get sensor details
PUT    /api/v1/sensors/{id}                  # Update sensor
DELETE /api/v1/sensors/{id}                  # Delete sensor
GET    /api/v1/sensors/{id}/status           # Get sensor health status
GET    /api/v1/sensors/{id}/readings         # Get readings for specific sensor
POST   /api/v1/sensors/{id}/calibrate        # Record calibration
GET    /api/v1/sensors/locations             # Get all sensor locations (for map)
```

### **Sensor Readings Endpoints**
```
POST   /api/v1/readings                      # Ingest single sensor reading
POST   /api/v1/readings/bulk                 # Bulk upload readings
GET    /api/v1/readings                      # Get readings with filters
GET    /api/v1/readings/latest               # Get latest readings from all sensors
GET    /api/v1/readings/timeseries           # Get time-series data
GET    /api/v1/readings/{id}                 # Get specific reading
DELETE /api/v1/readings/{id}                 # Delete reading
GET    /api/v1/readings/export               # Export readings as CSV
```

**Query Parameters for GET /api/v1/readings:**
```
?sensor_id=uuid           # Filter by sensor
?start_date=2026-01-01    # Start date
?end_date=2026-01-31      # End date
?metric=ph                # Filter by specific metric
?limit=100                # Pagination limit
?offset=0                 # Pagination offset
```

### **Analytics Endpoints**
```
GET    /api/v1/analytics/health-index        # Get water health index
GET    /api/v1/analytics/health-index/history # Health index over time
GET    /api/v1/analytics/trends              # Get trend analysis
GET    /api/v1/analytics/statistics          # Get statistical summary
GET    /api/v1/analytics/comparison          # Period-over-period comparison
GET    /api/v1/analytics/consumption         # Water consumption data
GET    /api/v1/analytics/compliance          # Compliance with standards
GET    /api/v1/analytics/kpi                 # Key performance indicators
GET    /api/v1/analytics/distribution        # Data distribution (histogram)
GET    /api/v1/analytics/correlation         # Metric correlations
```

**Query Parameters:**
```
?sensor_id=uuid           # Filter by sensor
?start_date=2026-01-01    # Start date
?end_date=2026-01-31      # End date
?granularity=hourly       # hourly, daily, weekly, monthly
?metrics=ph,turbidity     # Comma-separated metrics
```

### **Anomalies Endpoints**
```
GET    /api/v1/anomalies                     # List anomalies with filters
GET    /api/v1/anomalies/{id}                # Get anomaly details
PUT    /api/v1/anomalies/{id}/acknowledge    # Acknowledge anomaly
PUT    /api/v1/anomalies/{id}/resolve        # Mark anomaly as resolved
POST   /api/v1/anomalies/detect              # Trigger manual anomaly detection
GET    /api/v1/anomalies/insights            # Get anomaly insights/patterns
GET    /api/v1/anomalies/summary             # Get anomaly summary statistics
GET    /api/v1/anomalies/export              # Export anomalies as CSV
```

**Query Parameters:**
```
?sensor_id=uuid           # Filter by sensor
?severity=critical        # critical, high, medium, low
?status=open              # open, acknowledged, resolved
?metric=ph                # Filter by metric
?start_date=2026-01-01    # Start date
?end_date=2026-01-31      # End date
```

### **Predictions Endpoints**
```
GET    /api/v1/predictions                   # List predictions
POST   /api/v1/predictions/generate          # Generate new predictions
GET    /api/v1/predictions/{id}              # Get specific prediction
GET    /api/v1/predictions/forecast          # Get quality forecast
GET    /api/v1/predictions/accuracy          # Get model accuracy metrics
DELETE /api/v1/predictions/{id}              # Delete prediction
```

**Prediction Request Body:**
```json
{
  "sensor_id": "uuid",
  "metric": "ph",
  "horizon_hours": 24,
  "confidence_level": 0.95
}
```

### **Alert Configuration Endpoints**
```
GET    /api/v1/alerts                        # List alert configurations
POST   /api/v1/alerts                        # Create alert config
GET    /api/v1/alerts/{id}                   # Get alert config
PUT    /api/v1/alerts/{id}                   # Update alert config
DELETE /api/v1/alerts/{id}                   # Delete alert config
GET    /api/v1/alerts/history                # Get alert history
POST   /api/v1/alerts/{id}/test              # Test alert notification
GET    /api/v1/alerts/templates              # Get notification templates
```

**Alert Configuration Schema:**
```json
{
  "metric": "ph",
  "min_threshold": 6.5,
  "max_threshold": 8.5,
  "severity": "critical",
  "notification_method": "email",
  "is_active": true
}
```

### **Report Endpoints**
```
GET    /api/v1/reports                       # List reports
POST   /api/v1/reports/generate              # Generate new report
GET    /api/v1/reports/{id}                  # Get report details
GET    /api/v1/reports/{id}/download         # Download report file
DELETE /api/v1/reports/{id}                  # Delete report
GET    /api/v1/reports/templates             # Get report templates
```

**Report Generation Request:**
```json
{
  "report_type": "custom",
  "title": "Monthly Water Quality Report",
  "start_date": "2026-01-01T00:00:00Z",
  "end_date": "2026-01-31T23:59:59Z",
  "file_format": "pdf",
  "metrics": ["ph", "turbidity", "tds"],
  "include_charts": true,
  "include_anomalies": true
}
```

### **File Upload Endpoints**
```
POST   /api/v1/upload/csv                    # Upload CSV file
POST   /api/v1/upload/json                   # Upload JSON file
POST   /api/v1/upload/xlsx                   # Upload Excel file
GET    /api/v1/upload/template               # Download template file
GET    /api/v1/upload/history                # Get upload history
POST   /api/v1/upload/validate               # Validate file before upload
```

**Upload Response:**
```json
{
  "success": true,
  "records_processed": 1000,
  "records_inserted": 998,
  "errors": [
    {"row": 45, "error": "Invalid pH value"}
  ]
}
```

### **User Management Endpoints (Admin Only)**
```
GET    /api/v1/users                         # List all users
POST   /api/v1/users                         # Create new user
GET    /api/v1/users/{id}                    # Get user details
PUT    /api/v1/users/{id}                    # Update user
DELETE /api/v1/users/{id}                    # Delete user
PUT    /api/v1/users/{id}/role               # Change user role
PUT    /api/v1/users/{id}/activate           # Activate user
PUT    /api/v1/users/{id}/deactivate         # Deactivate user
```

### **WebSocket Endpoints**
```
WS     /ws/readings                          # Real-time sensor data stream
WS     /ws/alerts                            # Real-time alert notifications
WS     /ws/anomalies                         # Real-time anomaly detection
```

**WebSocket Message Format (Readings):**
```json
{
  "type": "reading",
  "sensor_id": "uuid",
  "timestamp": "2026-01-21T10:30:00Z",
  "data": {
    "ph": 7.2,
    "turbidity": 2.3,
    "tds": 342,
    "temperature": 24.5
  }
}
```

---

## 🤖 MACHINE LEARNING PIPELINE

### **ML Models Overview**

#### **1. Water Quality Classification**
```
Input Features: [pH, turbidity, TDS, temperature, DO, conductivity, chlorine]
Output Classes: ['Excellent', 'Good', 'Fair', 'Poor', 'Unsafe']
Algorithm: Random Forest / XGBoost
Accuracy Target: 90%+
```

**Training Process:**
```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Features
X = df[['ph', 'turbidity', 'tds', 'temperature', 
        'dissolved_oxygen', 'conductivity', 'chlorine']]
y = df['quality_label']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Train model
model = RandomForestClassifier(n_estimators=100, max_depth=10)
model.fit(X_train, y_train)

# Evaluate
accuracy = model.score(X_test, y_test)
```

#### **2. Anomaly Detection**
```
Input: Time-series sensor data
Output: Anomaly score (0-1), Anomaly type
Algorithms: 
  - Isolation Forest (for single point anomalies)
  - LSTM Autoencoder (for temporal patterns)
  - Statistical methods (Z-score, IQR)
```

**Implementation:**
```python
from sklearn.ensemble import IsolationForest

# Single metric anomaly detection
iso_forest = IsolationForest(contamination=0.05)
anomaly_scores = iso_forest.fit_predict(data)

# LSTM Autoencoder for temporal patterns
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

model = Sequential([
    LSTM(64, activation='relu', return_sequences=True, input_shape=(timesteps, features)),
    LSTM(32, activation='relu', return_sequences=False),
    Dense(32, activation='relu'),
    Dense(features, activation='linear')
])

model.compile(optimizer='adam', loss='mse')
```

#### **3. Time Series Forecasting**
```
Input: Historical sensor readings (last 7-30 days)
Output: Predicted values for next 24-48 hours
Algorithms: 
  - LSTM (Long Short-Term Memory)
  - Prophet (Facebook's time series library)
  - ARIMA (for statistical baseline)
```

**LSTM Forecasting:**
```python
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

model = Sequential([
    LSTM(100, return_sequences=True, input_shape=(look_back, n_features)),
    Dropout(0.2),
    LSTM(50, return_sequences=False),
    Dropout(0.2),
    Dense(25),
    Dense(forecast_horizon)
])

model.compile(optimizer='adam', loss='mean_squared_error')
```

#### **4. Health Index Calculation**
```
Input: All current sensor metrics
Output: 0-100 health score
Method: Weighted ensemble model
```

**Health Index Formula:**
```python
def calculate_health_index(metrics):
    weights = {
        'ph': 0.25,
        'turbidity': 0.20,
        'tds': 0.15,
        'dissolved_oxygen': 0.20,
        'temperature': 0.10,
        'chlorine': 0.10
    }
    
    # Normalize each metric to 0-100 scale
    normalized = {}
    for metric, value in metrics.items():
        normalized[metric] = normalize_metric(metric, value)
    
    # Calculate weighted score
    health_index = sum(normalized[m] * weights[m] for m in metrics)
    return round(health_index, 1)
```

### **ML Folder Structure**

```
ML/
├── data/
│   ├── raw/                       # Original sensor data
│   │   ├── sensor_readings.csv
│   │   └── manual_labels.csv
│   ├── processed/                 # Cleaned & preprocessed
│   │   ├── training_data.csv
│   │   └── validation_data.csv
│   └── training/                  # Final training datasets
│       ├── quality_classification/
│       ├── anomaly_detection/
│       └── forecasting/
│
├── notebooks/
│   ├── 01_data_exploration.ipynb          # EDA
│   ├── 02_feature_engineering.ipynb      # Feature creation
│   ├── 03_anomaly_detection.ipynb        # Anomaly model development
│   ├── 04_quality_classification.ipynb   # Quality model development
│   ├── 05_forecasting.ipynb              # Time series forecasting
│   └── 06_model_evaluation.ipynb         # Model comparison
│
├── models/
│   ├── anomaly_detector.pkl              # Trained Isolation Forest
│   ├── anomaly_detector_lstm.h5          # Trained LSTM Autoencoder
│   ├── quality_classifier.pkl            # Trained Random Forest
│   ├── forecaster.h5                     # Trained LSTM Forecaster
│   ├── scaler.pkl                        # Feature scaler
│   └── label_encoder.pkl                 # Label encoder
│
├── scripts/
│   ├── train_anomaly_model.py            # Train anomaly detection
│   ├── train_classifier.py               # Train quality classifier
│   ├── train_forecaster.py               # Train forecasting model
│   ├── evaluate_models.py                # Evaluate all models
│   └── export_models.py                  # Export for production
│
└── requirements.txt                      # Python dependencies
```

### **Model Training Pipeline**

```python
# Example: train_classifier.py

import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import classification_report, accuracy_score

def train_quality_classifier():
    # Load data
    data = pd.read_csv('data/training/quality_classification/train.csv')
    
    # Features and target
    X = data[['ph', 'turbidity', 'tds', 'temperature', 
              'dissolved_oxygen', 'conductivity', 'chlorine']]
    y = data['quality_label']
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Hyperparameter tuning
    param_grid = {
        'n_estimators': [100, 200, 300],
        'max_depth': [10, 20, 30],
        'min_samples_split': [2, 5, 10]
    }
    
    rf = RandomForestClassifier(random_state=42)
    grid_search = GridSearchCV(rf, param_grid, cv=5, n_jobs=-1)
    grid_search.fit(X_train, y_train)
    
    # Best model
    best_model = grid_search.best_estimator_
    
    # Evaluate
    y_pred = best_model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {accuracy:.4f}")
    print(classification_report(y_test, y_pred))
    
    # Save model
    joblib.dump(best_model, 'models/quality_classifier.pkl')
    
    return best_model

if __name__ == "__main__":
    train_quality_classifier()
```

### **Model Deployment in Backend**

```python
# app/ml/quality_classifier.py

import joblib
import numpy as np
from typing import Dict, List

class WaterQualityClassifier:
    def __init__(self, model_path: str = "models/quality_classifier.pkl"):
        self.model = joblib.load(model_path)
        self.classes = ['Excellent', 'Good', 'Fair', 'Poor', 'Unsafe']
    
    def predict(self, features: Dict[str, float]) -> Dict:
        """
        Predict water quality from sensor readings
        
        Args:
            features: Dict with keys: ph, turbidity, tds, temperature, etc.
        
        Returns:
            Dict with prediction, confidence, and probabilities
        """
        # Prepare features in correct order
        X = np.array([[
            features['ph'],
            features['turbidity'],
            features['tds'],
            features['temperature'],
            features['dissolved_oxygen'],
            features['conductivity'],
            features['chlorine']
        ]])
        
        # Predict
        prediction = self.model.predict(X)[0]
        probabilities = self.model.predict_proba(X)[0]
        confidence = max(probabilities)
        
        return {
            'quality': prediction,
            'confidence': float(confidence),
            'probabilities': {
                class_name: float(prob) 
                for class_name, prob in zip(self.classes, probabilities)
            }
        }
```

---

## 🐳 DEPLOYMENT ARCHITECTURE

### **Docker Compose Setup**

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Frontend Service
  frontend:
    build:
      context: ./Frontend
      dockerfile: Dockerfile
    container_name: aquaflow-frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://backend:8000
      - VITE_WS_URL=ws://backend:8000
    depends_on:
      - backend
    networks:
      - aquaflow-network
    restart: unless-stopped

  # Backend Service
  backend:
    build:
      context: ./Backend
      dockerfile: Dockerfile
    container_name: aquaflow-backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://aquaflow:password123@postgres:5432/waterdb
      - REDIS_URL=redis://redis:6379/0
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
    volumes:
      - ./Backend/app:/app
      - ml-models:/app/ml/models
      - uploads:/app/uploads
    depends_on:
      - postgres
      - redis
    networks:
      - aquaflow-network
    restart: unless-stopped

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: aquaflow-postgres
    environment:
      - POSTGRES_USER=aquaflow
      - POSTGRES_PASSWORD=password123
      - POSTGRES_DB=waterdb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - aquaflow-network
    restart: unless-stopped

  # Redis Cache & Message Broker
  redis:
    image: redis:7-alpine
    container_name: aquaflow-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - aquaflow-network
    restart: unless-stopped

  # Celery Worker
  celery_worker:
    build:
      context: ./Backend
      dockerfile: Dockerfile
    container_name: aquaflow-celery-worker
    command: celery -A app.tasks.celery_app worker --loglevel=info
    environment:
      - DATABASE_URL=postgresql://aquaflow:password123@postgres:5432/waterdb
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - ./Backend/app:/app
      - ml-models:/app/ml/models
    depends_on:
      - redis
      - postgres
    networks:
      - aquaflow-network
    restart: unless-stopped

  # Celery Beat (Scheduler)
  celery_beat:
    build:
      context: ./Backend
      dockerfile: Dockerfile
    container_name: aquaflow-celery-beat
    command: celery -A app.tasks.celery_app beat --loglevel=info
    environment:
      - DATABASE_URL=postgresql://aquaflow:password123@postgres:5432/waterdb
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - redis
      - postgres
    networks:
      - aquaflow-network
    restart: unless-stopped

  # Flower (Celery Monitoring)
  flower:
    build:
      context: ./Backend
      dockerfile: Dockerfile
    container_name: aquaflow-flower
    command: celery -A app.tasks.celery_app flower --port=5555
    ports:
      - "5555:5555"
    environment:
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - redis
      - celery_worker
    networks:
      - aquaflow-network
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: aquaflow-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - aquaflow-network
    restart: unless-stopped

networks:
  aquaflow-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  ml-models:
  uploads:
```

### **Frontend Dockerfile**

```dockerfile
# Frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
```

### **Backend Dockerfile**

```dockerfile
# Backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

### **Nginx Configuration**

```nginx
# nginx/nginx.conf
upstream frontend {
    server frontend:3000;
}

upstream backend {
    server backend:8000;
}

server {
    listen 80;
    server_name localhost;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 🚀 DEVELOPMENT WORKFLOW

### **Weekly Development Plan**

#### **Week 3: Jan 22 - Jan 28 - Backend Infrastructure**
- [x] Set up FastAPI project structure
- [ ] Configure PostgreSQL database
- [ ] Create SQLAlchemy models (User, Sensor, Reading)
- [ ] Implement JWT authentication
- [ ] Create basic CRUD endpoints for sensors
- [ ] Write unit tests for authentication

**Deliverables:**
- Working authentication API
- Sensor management endpoints
- Database migrations

#### **Week 4: Jan 29 - Feb 4 - Data Ingestion**
- [ ] Build readings ingestion API
- [ ] Implement file upload handling (CSV/JSON/XLSX)
- [ ] Create data validation layer
- [ ] Set up Celery for background tasks
- [ ] Implement bulk data processing
- [ ] Connect frontend upload page to backend

**Deliverables:**
- File upload API
- Data validation system
- Connected frontend upload page

#### **Week 5: Feb 5 - Feb 11 - ML Foundation**
- [ ] Data collection and preprocessing
- [ ] Feature engineering pipeline
- [ ] Train water quality classification model
- [ ] Train basic anomaly detection model
- [ ] Model evaluation and selection
- [ ] Save trained models

**Deliverables:**
- Trained quality classifier
- Trained anomaly detector
- Model evaluation report

#### **Week 6: Feb 12 - Feb 18 - ML Integration**
- [ ] Integrate ML models with FastAPI
- [ ] Create prediction endpoints
- [ ] Implement health index calculation
- [ ] Build anomaly detection service
- [ ] Create ML model API documentation
- [ ] Test ML endpoints

**Deliverables:**
- ML API endpoints
- Health index algorithm
- Anomaly detection service

#### **Week 7: Feb 19 - Feb 25 - Analytics Backend**
- [ ] Implement analytics calculation service
- [ ] Create trend analysis endpoints
- [ ] Build statistical analysis functions
- [ ] Implement period comparison logic
- [ ] Create KPI calculation service
- [ ] Write tests for analytics

**Deliverables:**
- Complete analytics API
- Statistical functions
- Test coverage

#### **Week 8: Feb 26 - Mar 4 - Real-time & Integration**
- [ ] Implement WebSocket connections
- [ ] Create real-time data streaming
- [ ] Build alert notification system
- [ ] Connect all frontend pages to backend
- [ ] Implement error handling
- [ ] Add loading states

**Deliverables:**
- Working WebSocket
- Connected frontend
- Alert system

#### **Week 9: Mar 5 - Mar 11 - Advanced Features**
- [ ] Report generation service (PDF/CSV)
- [ ] Email notification system
- [ ] Scheduled tasks (daily reports, model retraining)
- [ ] Sensor management page backend
- [ ] Alert configuration API
- [ ] Map view data endpoints

**Deliverables:**
- Report generation
- Email notifications
- Scheduled tasks

#### **Week 10: Mar 12 - Mar 18 - Testing & Optimization**
- [ ] Comprehensive integration testing
- [ ] Load testing and performance optimization
- [ ] Database query optimization
- [ ] Caching implementation
- [ ] Security audit
- [ ] Bug fixes

**Deliverables:**
- Test reports
- Performance benchmarks
- Security audit report

#### **Week 11: Mar 19 - Mar 25 - Documentation & Polish**
- [ ] API documentation (Swagger)
- [ ] User guide documentation
- [ ] Code documentation
- [ ] Docker setup refinement
- [ ] CI/CD pipeline
- [ ] UI/UX improvements

**Deliverables:**
- Complete documentation
- Docker setup
- CI/CD pipeline

#### **Week 12: Mar 26 - Apr 1 - Deployment Prep**
- [ ] Production environment setup
- [ ] Monitoring and logging setup
- [ ] Backup strategy implementation
- [ ] SSL certificate setup
- [ ] Final security review
- [ ] Load testing on production

**Deliverables:**
- Production-ready application
- Monitoring dashboard
- Backup system

#### **Week 13: Apr 2 - Apr 8 - Final Deployment**
- [ ] Deploy to production
- [ ] System monitoring
- [ ] User acceptance testing
- [ ] Final bug fixes
- [ ] Project handover documentation
- [ ] Final presentation

**Deliverables:**
- Live production system
- Final presentation
- Handover documentation

---

## 📊 DATA FLOW DIAGRAM

### **Real-time Data Flow**

```
┌─────────────────┐
│  IoT Sensors    │ (Physical Devices)
│  - pH Sensor    │
│  - Turbidity    │
│  - TDS Sensor   │
│  - Flow Meter   │
└────────┬────────┘
         │ MQTT / HTTP POST
         ▼
┌─────────────────────────┐
│  Data Ingestion Layer   │
│  FastAPI Endpoint       │
│  /api/v1/readings       │
└────────┬────────────────┘
         │
         ├──────────────► Redis Queue (Background Processing)
         │                        │
         │                        ▼
         │                ┌───────────────┐
         │                │ Celery Worker │
         │                │ - Validation  │
         │                │ - ML Scoring  │
         │                └───────┬───────┘
         │                        │
         ▼                        ▼
┌────────────────┐      ┌─────────────────┐
│  PostgreSQL    │◄─────┤  ML Pipeline    │
│  - Raw Data    │      │  - Anomaly Det. │
│  - Aggregated  │      │  - Quality Cls. │
└────────┬───────┘      │  - Health Index │
         │              └────────┬────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │  Alert Service  │
         │              │  - Check Rules  │
         │              │  - Notify Users │
         │              └────────┬────────┘
         │                       │
         │                       ├──► Email
         │                       ├──► SMS
         │                       └──► Push Notification
         │
         ▼
┌─────────────────────┐
│  WebSocket Server   │
│  Real-time Stream   │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  React Frontend     │
│  - Dashboard        │
│  - Analytics        │
│  - Alerts           │
└─────────────────────┘
```

### **Batch Processing Flow**

```
┌─────────────────┐
│  File Upload    │ (CSV/JSON/XLSX)
│  Frontend       │
└────────┬────────┘
         │ HTTP POST
         ▼
┌─────────────────────┐
│  Upload API         │
│  /api/v1/upload     │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  File Validation    │
│  - Format Check     │
│  - Schema Validate  │
│  - Data Quality     │
└────────┬────────────┘
         │
         ├──► Valid ──┐
         │            ▼
         │     ┌──────────────┐
         │     │ Celery Task  │
         │     │ Bulk Insert  │
         │     └──────┬───────┘
         │            │
         │            ▼
         │     ┌──────────────┐
         │     │ PostgreSQL   │
         │     │ Insert Data  │
         │     └──────┬───────┘
         │            │
         │            ▼
         │     ┌──────────────┐
         │     │ ML Processing│
         │     │ Batch Scoring│
         │     └──────┬───────┘
         │            │
         │            ▼
         │     ┌──────────────┐
         │     │ Update UI    │
         │     │ Success Msg  │
         │     └──────────────┘
         │
         └──► Invalid ──► Error Response
```

### **Analytics Data Flow**

```
┌─────────────────┐
│ User Request    │
│ Analytics Page  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ API Request             │
│ /api/v1/analytics/...   │
│ - Date Range            │
│ - Metrics               │
│ - Granularity           │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Analytics Service       │
│ - Query Database        │
│ - Calculate Stats       │
│ - Apply Aggregations    │
└────────┬────────────────┘
         │
         ├──► Query PostgreSQL
         │    │
         │    ▼
         │    ┌─────────────────┐
         │    │ Time-series     │
         │    │ Aggregation     │
         │    └─────────┬───────┘
         │              │
         ├──────────────┘
         │
         ├──► Calculate Trends
         ├──► Calculate Comparisons
         ├──► Calculate Statistics
         │
         ▼
┌─────────────────────────┐
│ Response with Charts    │
│ - Line Charts           │
│ - Bar Charts            │
│ - Pie Charts            │
│ - Statistics            │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Frontend Rendering      │
│ - Recharts Components   │
│ - Interactive UI        │
└─────────────────────────┘
```

---

## 🔐 SECURITY CONSIDERATIONS

### **Authentication & Authorization**

#### **JWT Token Structure**
```json
{
  "access_token": {
    "sub": "user_id",
    "email": "user@example.com",
    "role": "admin",
    "exp": 1706788800
  },
  "refresh_token": {
    "sub": "user_id",
    "type": "refresh",
    "exp": 1707996000
  }
}
```

#### **Role-Based Access Control (RBAC)**
```python
# app/utils/auth.py

from enum import Enum
from functools import wraps
from fastapi import HTTPException, status

class UserRole(Enum):
    ADMIN = "admin"          # Full access
    OPERATOR = "operator"    # Read/write sensors, view analytics
    VIEWER = "viewer"        # Read-only access

ROLE_PERMISSIONS = {
    UserRole.ADMIN: ["*"],
    UserRole.OPERATOR: [
        "sensors:read", "sensors:write",
        "readings:read", "readings:write",
        "analytics:read",
        "anomalies:read", "anomalies:acknowledge"
    ],
    UserRole.VIEWER: [
        "sensors:read",
        "readings:read",
        "analytics:read",
        "anomalies:read"
    ]
}

def require_permission(permission: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user=None, **kwargs):
            if current_user.role == UserRole.ADMIN:
                return await func(*args, current_user=current_user, **kwargs)
            
            if permission in ROLE_PERMISSIONS[current_user.role]:
                return await func(*args, current_user=current_user, **kwargs)
            
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return wrapper
    return decorator
```

### **Data Encryption**

```python
# app/utils/encryption.py

from cryptography.fernet import Fernet
import os

class DataEncryption:
    def __init__(self):
        # Load key from environment
        key = os.getenv("ENCRYPTION_KEY").encode()
        self.cipher = Fernet(key)
    
    def encrypt(self, data: str) -> str:
        """Encrypt sensitive data"""
        return self.cipher.encrypt(data.encode()).decode()
    
    def decrypt(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        return self.cipher.decrypt(encrypted_data.encode()).decode()

# Usage
encryptor = DataEncryption()
encrypted_password = encryptor.encrypt("sensitive_data")
```

### **Input Validation**

```python
# app/schemas/reading.py

from pydantic import BaseModel, validator, Field
from datetime import datetime

class SensorReadingCreate(BaseModel):
    sensor_id: str
    timestamp: datetime
    ph: float = Field(..., ge=0, le=14)
    turbidity: float = Field(..., ge=0, le=1000)
    tds: int = Field(..., ge=0, le=10000)
    temperature: float = Field(..., ge=-10, le=100)
    
    @validator('ph')
    def validate_ph(cls, v):
        if not (0 <= v <= 14):
            raise ValueError('pH must be between 0 and 14')
        return round(v, 2)
    
    @validator('timestamp')
    def validate_timestamp(cls, v):
        if v > datetime.now():
            raise ValueError('Timestamp cannot be in the future')
        return v
```

### **Rate Limiting**

```python
# app/middleware/rate_limit.py

from fastapi import Request, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# Usage in routes
@app.post("/api/v1/readings")
@limiter.limit("100/minute")
async def create_reading(request: Request, reading: SensorReadingCreate):
    # Handle request
    pass
```

### **SQL Injection Prevention**

```python
# Using SQLAlchemy ORM (parameterized queries)
from sqlalchemy import select

# Safe query
stmt = select(SensorReading).where(
    SensorReading.sensor_id == sensor_id
).where(
    SensorReading.timestamp >= start_date
)
results = session.execute(stmt).scalars().all()

# NEVER do this (vulnerable to SQL injection):
# query = f"SELECT * FROM readings WHERE sensor_id = '{sensor_id}'"
```

### **CORS Configuration**

```python
# app/main.py

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://aquaflow.example.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"]
)
```

### **Environment Variables**

```bash
# .env.example

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/waterdb

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Encryption
ENCRYPTION_KEY=your-encryption-key-here

# API Keys
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

### **Security Checklist**

- [x] HTTPS enforced in production
- [x] JWT tokens with expiration
- [x] Password hashing (bcrypt)
- [x] SQL injection prevention (ORM)
- [x] XSS prevention (React auto-escaping)
- [x] CSRF protection (SameSite cookies)
- [x] Rate limiting on API endpoints
- [x] Input validation on all endpoints
- [x] Environment variables for secrets
- [ ] Regular security audits
- [ ] Penetration testing
- [ ] OWASP compliance check

---

## 📈 MONITORING & LOGGING

### **Application Logging**

```python
# app/utils/logger.py

import logging
from logging.handlers import RotatingFileHandler
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)

def setup_logger(name: str):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # File handler
    file_handler = RotatingFileHandler(
        'logs/app.log',
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    file_handler.setFormatter(JSONFormatter())
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(JSONFormatter())
    
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

# Usage
logger = setup_logger(__name__)
logger.info("Sensor data received", extra={'user_id': user.id})
```

### **Performance Monitoring**

```python
# app/middleware/monitoring.py

from fastapi import Request
import time
import logging

logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    
    logger.info(
        "Request completed",
        extra={
            'method': request.method,
            'url': str(request.url),
            'status_code': response.status_code,
            'process_time': f"{process_time:.4f}s"
        }
    )
    
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

### **Error Tracking with Sentry**

```python
# app/main.py

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0,
    environment="production"
)
```

### **Database Query Monitoring**

```python
# Log slow queries
from sqlalchemy import event
from sqlalchemy.engine import Engine
import logging

logger = logging.getLogger(__name__)

@event.listens_for(Engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    conn.info.setdefault('query_start_time', []).append(time.time())

@event.listens_for(Engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total = time.time() - conn.info['query_start_time'].pop(-1)
    if total > 1.0:  # Log queries slower than 1 second
        logger.warning(f"Slow query ({total:.2f}s): {statement}")
```

### **Health Check Endpoints**

```python
# app/api/v1/health.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
import redis

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "healthy"}

@router.get("/health/db")
async def database_health(db: Session = Depends(get_db)):
    try:
        db.execute("SELECT 1")
        return {"database": "healthy"}
    except Exception as e:
        return {"database": "unhealthy", "error": str(e)}

@router.get("/health/redis")
async def redis_health():
    try:
        r = redis.from_url(os.getenv("REDIS_URL"))
        r.ping()
        return {"redis": "healthy"}
    except Exception as e:
        return {"redis": "unhealthy", "error": str(e)}
```

### **Metrics Collection (Prometheus)**

```python
# app/middleware/metrics.py

from prometheus_client import Counter, Histogram, generate_latest
from fastapi import Request
import time

# Define metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency',
    ['method', 'endpoint']
)

@app.middleware("http")
async def track_metrics(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    latency = time.time() - start_time
    
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    REQUEST_LATENCY.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(latency)
    
    return response

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

---

## 🎯 SUCCESS METRICS

### **Technical KPIs**
- API Response Time: < 200ms (95th percentile)
- Database Query Time: < 100ms average
- ML Model Inference Time: < 50ms
- System Uptime: 99.9%
- Error Rate: < 0.1%

### **Functional KPIs**
- Anomaly Detection Accuracy: > 90%
- Water Quality Classification Accuracy: > 90%
- Prediction Accuracy: > 85%
- False Positive Rate: < 5%
- Alert Response Time: < 1 minute

### **User Experience KPIs**
- Page Load Time: < 2 seconds
- Dashboard Refresh Rate: Every 5 seconds
- Real-time Data Latency: < 1 second
- Report Generation Time: < 30 seconds

---

## 📝 NOTES

### **Current Status (Jan 21, 2026)**
- ✅ Frontend: Basic structure complete with 6 pages
- ✅ React Router: Fully implemented
- ✅ UI Components: Core components built
- 🔲 Backend: Not started
- 🔲 Database: Not set up
- 🔲 ML Models: Not trained
- 🔲 Deployment: Not configured

### **Immediate Next Steps**
1. Set up Backend FastAPI project structure
2. Configure PostgreSQL database
3. Create database models and migrations
4. Implement authentication API
5. Build sensor CRUD endpoints

### **Technology Decisions Made**
- Frontend: React 19 + Vite (chosen for speed and modern features)
- Backend: FastAPI (chosen for async support and auto documentation)
- Database: PostgreSQL (chosen for reliability and JSON support)
- ML: Scikit-learn + TensorFlow (industry standard)
- Deployment: Docker Compose (easy local development and deployment)

---

## 📚 REFERENCES

### **Documentation Links**
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Recharts Documentation](https://recharts.org/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Celery Documentation](https://docs.celeryq.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### **Best Practices**
- [REST API Design Best Practices](https://restfulapi.net/)
- [12-Factor App Methodology](https://12factor.net/)
- [OWASP Security Practices](https://owasp.org/)
- [Clean Code Principles](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)

---

**Document Version**: 1.0  
**Last Updated**: January 21, 2026  
**Author**: Development Team  
**Status**: Living Document (Updated Weekly)
