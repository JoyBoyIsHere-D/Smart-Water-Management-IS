"""
Supabase client initialization and helper functions.
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Try to import supabase, but don't fail if not available
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    Client = None
    create_client = None

from typing import Optional

# Load settings
try:
    from config import settings
except ImportError:
    # Fallback if config not available
    class settings:
        SUPABASE_URL = os.getenv("SUPABASE_URL", "")
        SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
        SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

# Global Supabase client
supabase: Optional[Client] = None

def get_supabase_client() -> Optional[Client]:
    """
    Get or create Supabase client instance.
    Returns None if Supabase is not configured or not available.
    """
    global supabase
    
    if not SUPABASE_AVAILABLE:
        return None
    
    if supabase is not None:
        return supabase
    
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_KEY
    
    if not url or not key:
        print("⚠️  Supabase not configured. Please set SUPABASE_URL and SUPABASE_KEY in .env file.")
        return None
    
    try:
        supabase = create_client(url, key)
        print("\n" + "="*60)
        print("  ✅ SUPABASE CONNECTION SUCCESSFUL")
        print("="*60)
        print(f"  📍 URL: {url[:50]}...")
        print(f"  🔑 API Key: {key[:20]}...{key[-10:]}")
        print("  🗄️  Database ready for operations")
        print("="*60 + "\n")
        return supabase
    except Exception as e:
        print("\n" + "="*60)
        print("  ❌ SUPABASE CONNECTION FAILED")
        print("="*60)
        print(f"  Error: {e}")
        print("="*60 + "\n")
        return None

def get_supabase_admin_client() -> Optional[Client]:
    """
    Get Supabase client with service role key for admin operations.
    """
    url = settings.SUPABASE_URL
    service_key = settings.SUPABASE_SERVICE_KEY
    
    if not url or not service_key:
        return None
    
    try:
        return create_client(url, service_key)
    except Exception as e:
        print(f"Failed to create admin client: {e}")
        return None

# Initialize on import
get_supabase_client()
