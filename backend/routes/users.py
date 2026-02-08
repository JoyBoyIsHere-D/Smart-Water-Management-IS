"""
Routes for portal users.
  - POST /api/users/login       → user login (unique_id only, no password)
  - POST /api/users/register    → admin creates a portal user
  - GET  /api/users             → admin lists all portal users
  - GET  /api/users/{user_id}   → admin gets a single portal user
  - PUT  /api/users/{user_id}   → admin updates a portal user
  - DELETE /api/users/{user_id} → admin deletes a portal user
"""

from fastapi import APIRouter, HTTPException, status, Depends
from auth.database import (
    get_portal_user_by_unique_id,
    get_portal_user_by_id,
    create_portal_user,
    list_portal_users,
    update_portal_user,
    delete_portal_user,
    update_portal_user_last_sign_in,
)
from auth.jwt_handler import create_access_token, create_refresh_token, get_current_active_user
from auth.models import (
    PortalUserCreate,
    PortalUserUpdate,
    PortalUserLogin,
    PortalUserResponse,
    AuthResponse,
)
from datetime import datetime

router = APIRouter(prefix="/api/users", tags=["Portal Users"])


# ---------- helpers ----------

def _row_to_response(row: dict) -> dict:
    """Convert a portal_users DB row to a JSON-safe dict."""
    return {
        "id": str(row["id"]),
        "unique_id": row["unique_id"],
        "full_name": row["full_name"],
        "email": row.get("email"),
        "phone": row.get("phone"),
        "address": row.get("address"),
        "is_active": row.get("is_active", True),
        "created_at": row["created_at"].isoformat() if row.get("created_at") else None,
        "last_sign_in": row["last_sign_in"].isoformat() if row.get("last_sign_in") else None,
    }


# ==================== Public ====================

@router.post("/login")
async def user_login(payload: PortalUserLogin):
    """
    Portal user login – accepts unique_id only (no password).
    Returns JWT tokens so the user can access protected resources.
    """
    user = await get_portal_user_by_unique_id(payload.unique_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Unique ID. Please contact your administrator.",
        )
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact your administrator.",
        )

    # Record sign-in timestamp
    await update_portal_user_last_sign_in(str(user["id"]))

    # Build JWT with role = "user" so we can distinguish from admin tokens
    token_data = {
        "sub": str(user["id"]),
        "email": user.get("email", ""),
        "role": "user",
        "unique_id": user["unique_id"],
    }
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return {
        "success": True,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": 1800,
        "user": _row_to_response(user),
    }


# ==================== Admin-only ====================

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_portal_user(
    payload: PortalUserCreate,
    admin=Depends(get_current_active_user),
):
    """Admin creates a new portal user."""
    existing = await get_portal_user_by_unique_id(payload.unique_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A user with Unique ID '{payload.unique_id}' already exists.",
        )

    user = await create_portal_user(
        unique_id=payload.unique_id,
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        address=payload.address,
        created_by=admin.get("sub"),
    )
    return {"success": True, "message": "Portal user created", "user": _row_to_response(user)}


@router.get("")
async def get_all_portal_users(admin=Depends(get_current_active_user)):
    """Admin lists all portal users."""
    rows = await list_portal_users()
    return {"success": True, "users": [_row_to_response(r) for r in rows]}


@router.get("/{user_id}")
async def get_single_portal_user(user_id: str, admin=Depends(get_current_active_user)):
    """Admin fetches a single portal user by id."""
    user = await get_portal_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "user": _row_to_response(user)}


@router.put("/{user_id}")
async def update_single_portal_user(
    user_id: str,
    payload: PortalUserUpdate,
    admin=Depends(get_current_active_user),
):
    """Admin updates a portal user."""
    user = await update_portal_user(
        user_id=user_id,
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        address=payload.address,
        is_active=payload.is_active,
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "message": "User updated", "user": _row_to_response(user)}


@router.delete("/{user_id}")
async def delete_single_portal_user(user_id: str, admin=Depends(get_current_active_user)):
    """Admin deletes a portal user."""
    ok = await delete_portal_user(user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "message": "User deleted"}
