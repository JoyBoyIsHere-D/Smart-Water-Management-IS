"""
Authentication module for pure JWT-based authentication with PostgreSQL.
"""

from .jwt_handler import (
    create_access_token,
    create_refresh_token,
    verify_token,
    get_current_user,
    get_current_active_user
)

from .database import (
    get_pool,
    close_pool,
    ensure_tables,
    check_database_health
)

from .models import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    TokenRefresh
)

from .utils import (
    hash_password,
    verify_password,
    row_to_user_data
)

__all__ = [
    "create_access_token",
    "create_refresh_token",
    "verify_token",
    "get_current_user",
    "get_current_active_user",
    "get_pool",
    "close_pool",
    "ensure_tables",
    "check_database_health",
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "TokenResponse",
    "TokenRefresh",
    "hash_password",
    "verify_password",
    "row_to_user_data"
]
