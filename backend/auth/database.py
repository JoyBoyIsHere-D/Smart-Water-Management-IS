"""
PostgreSQL database connection and helper functions using asyncpg.
Replaces Supabase client with direct PostgreSQL access.
"""

import os
import sys
import asyncpg
from typing import Optional, Dict, Any, List, Union
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from config import settings
except ImportError:
    class settings:
        DATABASE_URL = os.getenv("DATABASE_URL", "")

# Global connection pool
_pool: Optional[asyncpg.Pool] = None


async def get_pool() -> asyncpg.Pool:
    """Get or create the asyncpg connection pool."""
    global _pool
    if _pool is None:
        dsn = settings.DATABASE_URL
        if not dsn:
            raise RuntimeError(
                "DATABASE_URL is not configured. "
                "Set it in your .env file, e.g. postgresql://user:pass@host:5432/dbname"
            )
        try:
            _pool = await asyncpg.create_pool(dsn=dsn, min_size=2, max_size=10)
            # Verify the connection is alive
            async with _pool.acquire() as conn:
                await conn.fetchval("SELECT 1")
            print("\n" + "=" * 60)
            print("  ✅ Postgres connected successfully")
            print("=" * 60 + "\n")
        except Exception as e:
            _pool = None
            print("\n" + "=" * 60)
            print("  ❌ Failed to connect to Postgres")
            print(f"  Error: {e}")
            print("=" * 60 + "\n")
            raise
    return _pool


async def close_pool():
    """Close the connection pool (call on app shutdown)."""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
        print("PostgreSQL connection pool closed.")


# ==================== SQL helpers for admin_users table ====================

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'admin',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_sign_in TIMESTAMPTZ
);
"""


async def ensure_tables():
    """Create all required tables if they do not exist."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(CREATE_TABLE_SQL)
        await conn.execute(CREATE_PORTAL_USERS_TABLE_SQL)
        await conn.execute(CREATE_SENSOR_READINGS_TABLE_SQL)
    print("✓ admin_users table ensured")
    print("✓ portal_users table ensured")
    print("✓ sensor_readings table ensured")


async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Fetch a user row by email. Returns dict or None."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM admin_users WHERE email = $1", email
        )
    return dict(row) if row else None


async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a user row by id (UUID string)."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM admin_users WHERE id = $1::uuid", user_id
        )
    return dict(row) if row else None


async def create_user(
    email: str, password_hash: str, full_name: Optional[str] = None, role: str = "admin"
) -> Dict[str, Any]:
    """Insert a new user and return the created row as dict."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO admin_users (email, password_hash, full_name, role, is_active)
            VALUES ($1, $2, $3, $4, TRUE)
            RETURNING *
            """,
            email, password_hash, full_name, role,
        )
    return dict(row)


async def update_user_profile(
    user_id: str,
    full_name: Optional[str] = None,
    avatar_url: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Update profile fields for a user. Returns updated row."""
    pool = await get_pool()
    sets = ["updated_at = now()"]
    args: list = []
    idx = 1

    if full_name is not None:
        sets.append(f"full_name = ${idx}")
        args.append(full_name)
        idx += 1
    if avatar_url is not None:
        sets.append(f"avatar_url = ${idx}")
        args.append(avatar_url)
        idx += 1

    args.append(user_id)
    sql = f"UPDATE admin_users SET {', '.join(sets)} WHERE id = ${idx}::uuid RETURNING *"

    async with pool.acquire() as conn:
        row = await conn.fetchrow(sql, *args)
    return dict(row) if row else None


async def update_user_password(user_id: str, password_hash: str) -> bool:
    """Update a user's password hash. Returns True on success."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute(
            "UPDATE admin_users SET password_hash = $1, updated_at = now() WHERE id = $2::uuid",
            password_hash, user_id,
        )
    return result == "UPDATE 1"


async def update_last_sign_in(user_id: str):
    """Set last_sign_in to now()."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "UPDATE admin_users SET last_sign_in = now() WHERE id = $1::uuid", user_id
        )


async def check_database_health() -> bool:
    """Return True if the database is reachable."""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        return True
    except Exception:
        return False


# ==================== SQL helpers for portal_users table ====================

CREATE_PORTAL_USERS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS portal_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unique_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_sign_in TIMESTAMPTZ,
    created_by UUID REFERENCES admin_users(id)
);
"""


async def ensure_portal_users_table():
    """Create the portal_users table if it does not exist."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(CREATE_PORTAL_USERS_TABLE_SQL)
    print("✓ portal_users table ensured")


async def get_portal_user_by_unique_id(unique_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a portal user by their unique_id."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM portal_users WHERE unique_id = $1", unique_id
        )
    return dict(row) if row else None


async def get_portal_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a portal user by UUID."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM portal_users WHERE id = $1::uuid", user_id
        )
    return dict(row) if row else None


async def create_portal_user(
    unique_id: str,
    full_name: str,
    email: Optional[str] = None,
    phone: Optional[str] = None,
    address: Optional[str] = None,
    created_by: Optional[str] = None,
) -> Dict[str, Any]:
    """Insert a new portal user. Returns the created row."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO portal_users (unique_id, full_name, email, phone, address, created_by)
            VALUES ($1, $2, $3, $4, $5, $6::uuid)
            RETURNING *
            """,
            unique_id, full_name, email, phone, address, created_by,
        )
    return dict(row)


async def list_portal_users() -> List[Dict[str, Any]]:
    """Return all portal users."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM portal_users ORDER BY created_at DESC"
        )
    return [dict(r) for r in rows]


async def update_portal_user(
    user_id: str,
    full_name: Optional[str] = None,
    email: Optional[str] = None,
    phone: Optional[str] = None,
    address: Optional[str] = None,
    is_active: Optional[bool] = None,
) -> Optional[Dict[str, Any]]:
    """Update a portal user. Returns updated row."""
    pool = await get_pool()
    sets = ["updated_at = now()"]
    args: list = []
    idx = 1

    for field, value in [
        ("full_name", full_name), ("email", email),
        ("phone", phone), ("address", address), ("is_active", is_active),
    ]:
        if value is not None:
            sets.append(f"{field} = ${idx}")
            args.append(value)
            idx += 1

    args.append(user_id)
    sql = f"UPDATE portal_users SET {', '.join(sets)} WHERE id = ${idx}::uuid RETURNING *"

    async with pool.acquire() as conn:
        row = await conn.fetchrow(sql, *args)
    return dict(row) if row else None


async def delete_portal_user(user_id: str) -> bool:
    """Delete a portal user. Returns True on success."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute(
            "DELETE FROM portal_users WHERE id = $1::uuid", user_id
        )
    return result == "DELETE 1"


async def update_portal_user_last_sign_in(user_id: str):
    """Set last_sign_in to now() for a portal user."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "UPDATE portal_users SET last_sign_in = now() WHERE id = $1::uuid", user_id
        )


# ==================== SQL helpers for sensor_readings table ====================

CREATE_SENSOR_READINGS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
    unique_id TEXT NOT NULL,

    -- Sensor measurements
    ph NUMERIC(5, 2),
    pressure NUMERIC(8, 2),
    flow_rate NUMERIC(10, 2),
    total_volume_passed NUMERIC(14, 2),
    temperature NUMERIC(6, 2),
    tds INTEGER,
    dissolved_oxygen NUMERIC(6, 2),

    -- Quality assessment (from AI model)
    water_quality TEXT,
    risk_level TEXT,

    -- Metadata
    device_id TEXT,
    location TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_sensor_user_timestamp
    ON sensor_readings(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_sensor_unique_id_timestamp
    ON sensor_readings(unique_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_sensor_timestamp
    ON sensor_readings(timestamp DESC);
"""


async def ensure_sensor_readings_table():
    """Create the sensor_readings table if it does not exist."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(CREATE_SENSOR_READINGS_TABLE_SQL)
    print("✓ sensor_readings table ensured")


async def create_sensor_reading(
    user_id: str,
    unique_id: str,
    ph: float = None,
    pressure: float = None,
    flow_rate: float = None,
    total_volume_passed: float = None,
    temperature: float = None,
    tds: int = None,
    dissolved_oxygen: float = None,
    water_quality: str = None,
    risk_level: str = None,
    device_id: str = None,
    location: str = None,
    timestamp: Union[datetime, str] = None,
) -> Dict[str, Any]:
    """Insert a new sensor reading into the database."""
    # Convert string timestamp to datetime if needed
    if timestamp and isinstance(timestamp, str):
        timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))

    pool = await get_pool()
    async with pool.acquire() as conn:
        if timestamp:
            row = await conn.fetchrow(
                """
                INSERT INTO sensor_readings (
                    user_id, unique_id, ph, pressure, flow_rate,
                    total_volume_passed, temperature, tds, dissolved_oxygen,
                    water_quality, risk_level, device_id, location, timestamp
                )
                VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::timestamptz)
                RETURNING *
                """,
                user_id, unique_id, ph, pressure, flow_rate,
                total_volume_passed, temperature, tds, dissolved_oxygen,
                water_quality, risk_level, device_id, location, timestamp
            )
        else:
            row = await conn.fetchrow(
                """
                INSERT INTO sensor_readings (
                    user_id, unique_id, ph, pressure, flow_rate,
                    total_volume_passed, temperature, tds, dissolved_oxygen,
                    water_quality, risk_level, device_id, location
                )
                VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING *
                """,
                user_id, unique_id, ph, pressure, flow_rate,
                total_volume_passed, temperature, tds, dissolved_oxygen,
                water_quality, risk_level, device_id, location
            )
    return dict(row)


async def get_sensor_readings_by_user(
    user_id: str,
    limit: int = 100,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """Get sensor readings for a specific user."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT * FROM sensor_readings
            WHERE user_id = $1::uuid
            ORDER BY timestamp DESC
            LIMIT $2 OFFSET $3
            """,
            user_id, limit, offset
        )
    return [dict(row) for row in rows]


async def get_sensor_readings_by_unique_id(
    unique_id: str,
    limit: int = 100,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """Get sensor readings by unique_id."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT * FROM sensor_readings
            WHERE unique_id = $1
            ORDER BY timestamp DESC
            LIMIT $2 OFFSET $3
            """,
            unique_id, limit, offset
        )
    return [dict(row) for row in rows]


async def get_latest_reading_by_unique_id(unique_id: str) -> Optional[Dict[str, Any]]:
    """Get the most recent sensor reading for a user."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT * FROM sensor_readings
            WHERE unique_id = $1
            ORDER BY timestamp DESC
            LIMIT 1
            """,
            unique_id
        )
    return dict(row) if row else None


async def get_sensor_readings_by_date_range(
    unique_id: str,
    start_date: str,
    end_date: str
) -> List[Dict[str, Any]]:
    """Get sensor readings within a date range."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT * FROM sensor_readings
            WHERE unique_id = $1
            AND timestamp BETWEEN $2::timestamptz AND $3::timestamptz
            ORDER BY timestamp DESC
            """,
            unique_id, start_date, end_date
        )
    return [dict(row) for row in rows]


async def get_sensor_statistics(unique_id: str) -> Dict[str, Any]:
    """Get statistical summary for a user's sensor readings."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT
                COUNT(*) as total_readings,
                AVG(ph) as avg_ph,
                AVG(pressure) as avg_pressure,
                AVG(flow_rate) as avg_flow_rate,
                AVG(temperature) as avg_temperature,
                AVG(tds) as avg_tds,
                AVG(dissolved_oxygen) as avg_dissolved_oxygen,
                MIN(ph) as min_ph,
                MAX(ph) as max_ph,
                MIN(temperature) as min_temp,
                MAX(temperature) as max_temp,
                SUM(CASE WHEN water_quality = 'Safe' THEN 1 ELSE 0 END) as safe_count,
                SUM(CASE WHEN water_quality = 'Unsafe' THEN 1 ELSE 0 END) as unsafe_count
            FROM sensor_readings
            WHERE unique_id = $1
            """,
            unique_id
        )
    return dict(row) if row else {}


async def get_all_users_latest_readings() -> List[Dict[str, Any]]:
    """Get the latest reading for each user (for admin dashboard)."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT DISTINCT ON (unique_id) *
            FROM sensor_readings
            ORDER BY unique_id, timestamp DESC
            """
        )
    return [dict(row) for row in rows]


async def delete_sensor_readings_by_user(user_id: str) -> int:
    """Delete all sensor readings for a user. Returns count deleted."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute(
            "DELETE FROM sensor_readings WHERE user_id = $1::uuid",
            user_id
        )
    # Extract count from result like "DELETE 5"
    return int(result.split()[-1]) if result else 0
