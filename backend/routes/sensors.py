"""
Sensor readings API routes.
Handles IoT device data submission and retrieval.
"""

from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from auth.database import (
    get_portal_user_by_unique_id,
    create_sensor_reading,
    get_sensor_readings_by_unique_id,
    get_latest_reading_by_unique_id,
    get_sensor_readings_by_date_range,
    get_sensor_statistics,
    get_all_users_latest_readings,
)

router = APIRouter(prefix="/api/sensors", tags=["Sensors"])


# ==================== Pydantic Schemas ====================

class SensorReadingCreate(BaseModel):
    """Schema for creating new sensor reading from IoT device."""
    unique_id: str = Field(..., description="User's unique ID (e.g., WU-2024-001)")
    ph: float = Field(..., ge=0, le=14, description="pH level")
    pressure: float = Field(..., ge=0, description="Pressure in bar")
    flow_rate: float = Field(..., ge=0, description="Flow rate in L/min")
    total_volume_passed: float = Field(..., ge=0, description="Total volume in liters")
    temperature: float = Field(..., description="Temperature in Celsius")
    tds: int = Field(..., ge=0, description="Total Dissolved Solids in ppm")

    # Optional fields
    dissolved_oxygen: Optional[float] = Field(None, ge=0, description="Dissolved O2 in mg/L")
    device_id: Optional[str] = Field(None, description="IoT device identifier")
    location: Optional[str] = Field(None, description="Physical location")

    class Config:
        json_schema_extra = {
            "example": {
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
        }


class SensorReadingResponse(BaseModel):
    """Schema for sensor reading response."""
    id: str
    user_id: str
    unique_id: str
    ph: Optional[float]
    pressure: Optional[float]
    flow_rate: Optional[float]
    total_volume_passed: Optional[float]
    temperature: Optional[float]
    tds: Optional[int]
    dissolved_oxygen: Optional[float]
    water_quality: Optional[str]
    risk_level: Optional[str]
    device_id: Optional[str]
    location: Optional[str]
    timestamp: datetime
    created_at: datetime


class SensorStatisticsResponse(BaseModel):
    """Schema for sensor statistics response."""
    total_readings: int
    avg_ph: Optional[float]
    avg_pressure: Optional[float]
    avg_flow_rate: Optional[float]
    avg_temperature: Optional[float]
    avg_tds: Optional[float]
    avg_dissolved_oxygen: Optional[float]
    min_ph: Optional[float]
    max_ph: Optional[float]
    min_temp: Optional[float]
    max_temp: Optional[float]
    safe_count: int
    unsafe_count: int


# ==================== Helper Functions ====================

def assess_water_quality(ph: float, tds: int, temperature: float) -> tuple:
    """
    Simple rule-based water quality assessment.
    Returns (water_quality, risk_level)
    """
    issues = []

    # pH check (safe range: 6.5 - 8.5)
    if ph < 6.5 or ph > 8.5:
        issues.append("pH out of range")

    # TDS check (safe range: < 500 ppm)
    if tds > 500:
        issues.append("High TDS")

    # Temperature check (safe range: 10 - 30 C)
    if temperature < 10 or temperature > 35:
        issues.append("Temperature out of range")

    if len(issues) == 0:
        return ("Safe", "Low")
    elif len(issues) == 1:
        return ("Unsafe", "Medium")
    else:
        return ("Unsafe", "High")


def serialize_reading(row: dict) -> dict:
    """Convert database row to JSON-serializable dict."""
    result = {}
    for key, value in row.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
        elif hasattr(value, '__str__') and key in ['id', 'user_id']:
            result[key] = str(value)
        elif value is not None:
            result[key] = float(value) if isinstance(value, (int, float)) and key not in ['tds'] else value
            if key == 'tds' and value is not None:
                result[key] = int(value)
        else:
            result[key] = value
    return result


# ==================== API Endpoints ====================

@router.post("/readings", status_code=status.HTTP_201_CREATED)
async def submit_sensor_reading(payload: SensorReadingCreate):
    """
    IoT devices submit sensor readings here.

    This endpoint:
    1. Validates the unique_id exists
    2. Assesses water quality
    3. Stores the reading in the database
    """
    # Verify user exists
    user = await get_portal_user_by_unique_id(payload.unique_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with unique_id '{payload.unique_id}' not found"
        )

    # Assess water quality
    water_quality, risk_level = assess_water_quality(
        payload.ph, payload.tds, payload.temperature
    )

    # Store in database
    result = await create_sensor_reading(
        user_id=str(user["id"]),
        unique_id=payload.unique_id,
        ph=payload.ph,
        pressure=payload.pressure,
        flow_rate=payload.flow_rate,
        total_volume_passed=payload.total_volume_passed,
        temperature=payload.temperature,
        tds=payload.tds,
        dissolved_oxygen=payload.dissolved_oxygen,
        water_quality=water_quality,
        risk_level=risk_level,
        device_id=payload.device_id,
        location=payload.location,
    )

    return {
        "success": True,
        "message": "Sensor reading stored successfully",
        "reading_id": str(result["id"]),
        "timestamp": result["timestamp"].isoformat(),
        "water_quality": water_quality,
        "risk_level": risk_level
    }


@router.get("/readings/{unique_id}")
async def get_readings(
    unique_id: str,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0)
):
    """Get sensor readings for a user (for frontend dashboard)."""
    user = await get_portal_user_by_unique_id(unique_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with unique_id '{unique_id}' not found"
        )

    readings = await get_sensor_readings_by_unique_id(unique_id, limit, offset)

    return {
        "unique_id": unique_id,
        "count": len(readings),
        "readings": [serialize_reading(r) for r in readings]
    }


@router.get("/readings/{unique_id}/latest")
async def get_latest(unique_id: str):
    """Get the most recent sensor reading for a user."""
    user = await get_portal_user_by_unique_id(unique_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with unique_id '{unique_id}' not found"
        )

    reading = await get_latest_reading_by_unique_id(unique_id)
    if not reading:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No readings found for this user"
        )

    return serialize_reading(reading)


@router.get("/readings/{unique_id}/statistics")
async def get_statistics(unique_id: str):
    """Get statistical summary for a user's sensor readings."""
    user = await get_portal_user_by_unique_id(unique_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with unique_id '{unique_id}' not found"
        )

    stats = await get_sensor_statistics(unique_id)

    # Convert Decimal to float for JSON serialization
    return {
        "unique_id": unique_id,
        "total_readings": int(stats.get("total_readings", 0)),
        "avg_ph": float(stats["avg_ph"]) if stats.get("avg_ph") else None,
        "avg_pressure": float(stats["avg_pressure"]) if stats.get("avg_pressure") else None,
        "avg_flow_rate": float(stats["avg_flow_rate"]) if stats.get("avg_flow_rate") else None,
        "avg_temperature": float(stats["avg_temperature"]) if stats.get("avg_temperature") else None,
        "avg_tds": float(stats["avg_tds"]) if stats.get("avg_tds") else None,
        "avg_dissolved_oxygen": float(stats["avg_dissolved_oxygen"]) if stats.get("avg_dissolved_oxygen") else None,
        "min_ph": float(stats["min_ph"]) if stats.get("min_ph") else None,
        "max_ph": float(stats["max_ph"]) if stats.get("max_ph") else None,
        "min_temp": float(stats["min_temp"]) if stats.get("min_temp") else None,
        "max_temp": float(stats["max_temp"]) if stats.get("max_temp") else None,
        "safe_count": int(stats.get("safe_count", 0)),
        "unsafe_count": int(stats.get("unsafe_count", 0)),
    }


@router.get("/readings/{unique_id}/range")
async def get_readings_in_range(
    unique_id: str,
    start_date: str = Query(..., description="Start date ISO format"),
    end_date: str = Query(..., description="End date ISO format")
):
    """Get sensor readings within a date range."""
    user = await get_portal_user_by_unique_id(unique_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with unique_id '{unique_id}' not found"
        )

    readings = await get_sensor_readings_by_date_range(unique_id, start_date, end_date)

    return {
        "unique_id": unique_id,
        "start_date": start_date,
        "end_date": end_date,
        "count": len(readings),
        "readings": [serialize_reading(r) for r in readings]
    }


@router.get("/dashboard/all-users")
async def get_all_users_dashboard():
    """Get latest readings for all users (admin dashboard)."""
    readings = await get_all_users_latest_readings()

    return {
        "total_users": len(readings),
        "users": [serialize_reading(r) for r in readings]
    }


@router.get("/health")
async def sensor_health():
    """Health check for sensor API."""
    return {
        "status": "healthy",
        "service": "sensor-readings-api"
    }
