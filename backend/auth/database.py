"""
PostgreSQL database connection and helper functions using asyncpg.
Replaces Supabase client with direct PostgreSQL access.
"""

import os
import sys
import asyncpg
from typing import Optional, Dict, Any, List

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
    print("✓ admin_users table ensured")
    print("✓ portal_users table ensured")


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
