"""
Authentication API routes.
Uses pure JWT authentication with PostgreSQL for data persistence.
"""

from fastapi import APIRouter, HTTPException, status, Depends

from .models import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    TokenRefresh, PasswordReset, PasswordUpdate, ProfileUpdate, AuthResponse
)
from .jwt_handler import (
    create_access_token, create_refresh_token, verify_token,
    get_current_user, get_current_active_user
)
from .database import (
    get_user_by_email, create_user, update_user_profile,
    update_user_password, update_last_sign_in, check_database_health
)
from .utils import hash_password, verify_password, row_to_user_data
from config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def create_token_response(user_data: dict) -> TokenResponse:
    """Create token response with access and refresh tokens"""
    token_data = {
        "sub": user_data["id"],
        "email": user_data["email"],
        "full_name": user_data.get("full_name")
    }

    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(**user_data)
    )

# ==================== API Endpoints ====================


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """
    Register a new user.

    - **email**: Valid email address
    - **password**: Password (min 6 characters)
    - **full_name**: Optional full name
    """
    try:
        # Check if user already exists
        existing = await get_user_by_email(user_data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email is already registered. Please login instead."
            )

        hashed = hash_password(user_data.password)
        row = await create_user(
            email=user_data.email,
            password_hash=hashed,
            full_name=user_data.full_name,
        )

        print(f"✓ User {user_data.email} registered successfully")
        user = row_to_user_data(row)
        return create_token_response(user)

    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Registration error: {error_msg}")

        if "unique" in error_msg.lower() or "duplicate" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email is already registered. Please login instead."
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {error_msg}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """
    Login with email and password.

    Returns access token and refresh token.
    """
    try:
        row = await get_user_by_email(credentials.email)

        if row is None or not verify_password(credentials.password, row["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if not row.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated. Contact an administrator."
            )

        # Update last sign-in timestamp
        await update_last_sign_in(str(row["id"]))

        user = row_to_user_data(row)
        return create_token_response(user)

    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Login failed: {error_msg}"
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(token_data: TokenRefresh):
    """
    Refresh access token using refresh token.
    """
    try:
        payload = verify_token(token_data.refresh_token, "refresh")

        user_data = {
            "id": payload.get("sub"),
            "email": payload.get("email"),
            "full_name": payload.get("full_name"),
            "email_confirmed": True
        }

        return create_token_response(user_data)

    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )


@router.post("/logout", response_model=AuthResponse)
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout current user.

    Note: JWT tokens are stateless, so this mainly serves as a confirmation.
    Client should discard the tokens.
    """
    return AuthResponse(
        success=True,
        message="Successfully logged out"
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_active_user)):
    """
    Get current authenticated user information.
    """
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user.get("full_name"),
        email_confirmed=True
    )


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Update current user's profile.
    """
    try:
        row = await update_user_profile(
            user_id=current_user["id"],
            full_name=profile_data.full_name,
            avatar_url=profile_data.avatar_url,
        )

        if row is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        user = row_to_user_data(row)
        return UserResponse(**user)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update profile: {str(e)}"
        )


@router.post("/password-reset", response_model=AuthResponse)
async def request_password_reset(reset_data: PasswordReset):
    """
    Request a password reset.

    Note: In a production system you would send an email with a reset link.
    For now this endpoint simply confirms that the request was received.
    """
    return AuthResponse(
        success=True,
        message="If the email exists, a password reset link has been sent."
    )


@router.post("/password-update", response_model=AuthResponse)
async def update_password(
    password_data: PasswordUpdate,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Update current user's password.
    """
    try:
        hashed = hash_password(password_data.new_password)
        success = await update_user_password(current_user["id"], hashed)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update password"
            )

        return AuthResponse(
            success=True,
            message="Password updated successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update password: {str(e)}"
        )


@router.get("/verify")
async def verify_auth_token(current_user: dict = Depends(get_current_user)):
    """
    Verify if the current token is valid.
    Returns user info if valid.
    """
    return {
        "valid": True,
        "user": current_user
    }


@router.get("/health")
async def auth_health_check():
    """
    Check if authentication service is available.
    """
    healthy = await check_database_health()

    if not healthy:
        return {
            "status": "unavailable",
            "message": "PostgreSQL database not reachable. Please check your DATABASE_URL."
        }

    return {
        "status": "healthy",
        "message": "Authentication service is connected to PostgreSQL"
    }
