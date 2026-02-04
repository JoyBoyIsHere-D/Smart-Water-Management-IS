"""
Authentication API routes.
Requires Supabase connection for data persistence.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import Optional
from datetime import datetime

from .models import (
    UserCreate, UserLogin, UserResponse, TokenResponse, 
    TokenRefresh, PasswordReset, PasswordUpdate, ProfileUpdate, AuthResponse
)
from .jwt_handler import (
    create_access_token, create_refresh_token, verify_token,
    get_current_user, get_current_active_user
)
from .supabase_client import get_supabase_client
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__truncate_error=True)

def hash_password(password: str) -> str:
    """Hash a password for storage. Truncates to 72 bytes for bcrypt compatibility."""
    # bcrypt only uses the first 72 bytes of a password
    # Truncate at byte level, not character level
    password_bytes = password.encode('utf-8')[:72]
    truncated_password = password_bytes.decode('utf-8', errors='ignore')
    return pwd_context.hash(truncated_password)

import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from config import settings
except ImportError:
    class settings:
        JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# ==================== Helper Functions ====================

def require_supabase():
    """Ensure Supabase is connected, raise error if not"""
    supabase = get_supabase_client()
    if supabase is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available. Please check Supabase configuration."
        )
    return supabase

def extract_user_data(supabase_user) -> dict:
    """Extract user data from Supabase user object"""
    if hasattr(supabase_user, 'user'):
        user = supabase_user.user
    else:
        user = supabase_user
    
    user_metadata = getattr(user, 'user_metadata', {}) or {}
    
    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user_metadata.get("full_name"),
        "avatar_url": user_metadata.get("avatar_url"),
        "email_confirmed": user.email_confirmed_at is not None if hasattr(user, 'email_confirmed_at') else False,
        "created_at": user.created_at if hasattr(user, 'created_at') else None,
        "last_sign_in": user.last_sign_in_at if hasattr(user, 'last_sign_in_at') else None
    }

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
    supabase = require_supabase()
    
    try:
        # Register with Supabase Auth (Supabase handles password hashing internally)
        response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,  # Send plain password - Supabase hashes it
            "options": {
                "data": {
                    "full_name": user_data.full_name
                }
            }
        })
        
        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration failed. Please try again."
            )
        
        user = extract_user_data(response)
        
        # Insert user into admin_users table with our own hash
        try:
            # Hash the password separately for our admin_users table
            hashed_password = hash_password(user_data.password)
            
            admin_user_data = {
                "id": user["id"],
                "email": user_data.email,
                "password_hash": hashed_password,  # Store hashed password
                "full_name": user_data.full_name,
                "role": "admin",
                "is_active": True
            }
            
            supabase.table("admin_users").insert(admin_user_data).execute()
            print(f"✓ User {user_data.email} added to admin_users table")
            
        except Exception as db_error:
            print(f"⚠️ Failed to insert into admin_users table: {db_error}")
            # Continue anyway - auth was successful
        
        return create_token_response(user)
        
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        
        # Better error message parsing
        if "User already registered" in error_msg or "already registered" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email is already registered. Please login instead."
            )
        
        if "Email rate limit exceeded" in error_msg or "rate limit" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many registration attempts. Please wait 60 seconds and try again."
            )
        
        # Log the full error for debugging
        print(f"❌ Registration error: {error_msg}")
        
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
    supabase = require_supabase()
    
    try:
        response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        user = extract_user_data(response)
        return create_token_response(user)
        
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "invalid" in error_msg.lower() or "credentials" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        if "rate limit" in error_msg.lower() or "too many requests" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please wait a few minutes before trying again."
            )
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
    supabase = get_supabase_client()
    
    if supabase:
        try:
            supabase.auth.sign_out()
        except Exception:
            pass  # Ignore Supabase logout errors
    
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
    supabase = require_supabase()
    
    try:
        update_data = {}
        if profile_data.full_name:
            update_data["full_name"] = profile_data.full_name
        if profile_data.avatar_url:
            update_data["avatar_url"] = profile_data.avatar_url
        
        response = supabase.auth.update_user({
            "data": update_data
        })
        
        user = extract_user_data(response)
        
        # Also update admin_users table
        try:
            supabase.table("admin_users").update({
                "full_name": profile_data.full_name,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", current_user["id"]).execute()
        except Exception as db_error:
            print(f"⚠️ Failed to update admin_users table: {db_error}")
        
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
    Request a password reset email.
    """
    supabase = require_supabase()
    
    try:
        supabase.auth.reset_password_email(reset_data.email)
        
        return AuthResponse(
            success=True,
            message="If the email exists, a password reset link has been sent."
        )
    except Exception:
        # Don't reveal if email exists or not
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
    supabase = require_supabase()
    
    try:
        supabase.auth.update_user({
            "password": password_data.new_password
        })
        
        return AuthResponse(
            success=True,
            message="Password updated successfully"
        )
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
    supabase = get_supabase_client()
    
    if supabase is None:
        return {
            "status": "unavailable",
            "message": "Supabase not configured. Please check your .env file."
        }
    
    return {
        "status": "healthy",
        "message": "Authentication service is connected to Supabase"
    }
