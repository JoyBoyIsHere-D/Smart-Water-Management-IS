"""
Authentication utility functions.
"""

from passlib.context import CryptContext

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password for storage. bcrypt automatically handles the 72-byte limit."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


def row_to_user_data(row: dict) -> dict:
    """Convert a database row to the user data dict used by token helpers."""
    return {
        "id": str(row["id"]),
        "email": row["email"],
        "full_name": row.get("full_name"),
        "avatar_url": row.get("avatar_url"),
        "email_confirmed": True,
        "created_at": row.get("created_at"),
        "last_sign_in": row.get("last_sign_in"),
    }
