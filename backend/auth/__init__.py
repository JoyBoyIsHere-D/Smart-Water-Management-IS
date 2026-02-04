"""
Authentication module for JWT-based authentication with Supabase.
"""

from .jwt_handler import (
    create_access_token,
    create_refresh_token,
    verify_token,
    get_current_user,
    get_current_active_user
)

from .supabase_client import (
    get_supabase_client,
    supabase
)

from .models import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    TokenRefresh
)

__all__ = [
    "create_access_token",
    "create_refresh_token", 
    "verify_token",
    "get_current_user",
    "get_current_active_user",
    "get_supabase_client",
    "supabase",
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "TokenResponse",
    "TokenRefresh"
]
