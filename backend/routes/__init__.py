"""
API routes module.
"""

from .clients import router as clients_router
from .data import router as data_router
from .model import router as model_router
from .training import router as training_router

__all__ = [
    "clients_router",
    "data_router",
    "model_router",
    "training_router"
]
