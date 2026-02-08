"""
Pydantic models for authentication.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# ==================== Request Models ====================

class UserCreate(BaseModel):
    """Model for user registration"""
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    full_name: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123",
                "full_name": "John Doe"
            }
        }

class UserLogin(BaseModel):
    """Model for user login"""
    email: EmailStr
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }

class TokenRefresh(BaseModel):
    """Model for token refresh"""
    refresh_token: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "refresh_token": "your-refresh-token-here"
            }
        }

class PasswordReset(BaseModel):
    """Model for password reset request"""
    email: EmailStr

class PasswordUpdate(BaseModel):
    """Model for password update"""
    new_password: str = Field(..., min_length=6)

class ProfileUpdate(BaseModel):
    """Model for profile update"""
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

# ==================== Response Models ====================

class UserResponse(BaseModel):
    """Model for user response"""
    id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    email_confirmed: bool = False
    created_at: Optional[datetime] = None
    last_sign_in: Optional[datetime] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "uuid-string",
                "email": "user@example.com",
                "full_name": "John Doe",
                "email_confirmed": True,
                "created_at": "2024-01-01T00:00:00Z"
            }
        }

class TokenResponse(BaseModel):
    """Model for token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "refresh_token": "refresh-token-string",
                "token_type": "bearer",
                "expires_in": 1800,
                "user": {
                    "id": "uuid-string",
                    "email": "user@example.com",
                    "full_name": "John Doe"
                }
            }
        }

class AuthResponse(BaseModel):
    """Generic auth response"""
    success: bool
    message: str
    data: Optional[dict] = None


# ==================== Portal User Models ====================

class PortalUserCreate(BaseModel):
    """Admin creates a portal user."""
    unique_id: str = Field(..., min_length=3, description="Unique login ID assigned by admin")
    full_name: str = Field(..., min_length=1)
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "unique_id": "WU-2024-001",
                "full_name": "Jane Doe",
                "email": "jane@example.com",
                "phone": "+91-9876543210",
                "address": "123 Water Lane"
            }
        }


class PortalUserUpdate(BaseModel):
    """Update a portal user."""
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None


class PortalUserLogin(BaseModel):
    """Portal user login – unique_id only, no password."""
    unique_id: str

    class Config:
        json_schema_extra = {
            "example": {
                "unique_id": "WU-2024-001"
            }
        }


class PortalUserResponse(BaseModel):
    """Portal user data returned to client."""
    id: str
    unique_id: str
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None
    last_sign_in: Optional[datetime] = None
