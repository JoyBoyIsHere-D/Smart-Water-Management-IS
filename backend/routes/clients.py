"""
Client management routes.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import httpx
import time

router = APIRouter(prefix="/api/clients", tags=["Client Management"])

# Client storage
CLIENTS: List[Dict[str, Any]] = []


class ClientCreate(BaseModel):
    id: str
    ip: str
    port: int = 5001


@router.get("")
async def list_clients():
    """List all registered clients"""
    return {
        "clients": CLIENTS,
        "total": len(CLIENTS)
    }


@router.post("")
async def add_client(client: ClientCreate):
    """Register a new client device"""
    if not client.ip or not client.id:
        raise HTTPException(status_code=400, detail="IP and ID are required")
    
    # Check if client already exists
    for c in CLIENTS:
        if c['ip'] == client.ip or c['id'] == client.id:
            raise HTTPException(status_code=409, detail="Client already registered")
    
    new_client = {
        "id": client.id,
        "ip": client.ip,
        "port": client.port,
        "status": "unknown",
        "last_seen": None
    }
    
    CLIENTS.append(new_client)
    
    return {
        "message": "Client registered successfully",
        "client": new_client,
        "clients": CLIENTS,
        "total_clients": len(CLIENTS)
    }


@router.delete("/{client_id}")
async def remove_client(client_id: str):
    """Remove a client from registry"""
    global CLIENTS
    CLIENTS = [c for c in CLIENTS if c['id'] != client_id]
    return {"message": "Client removed", "total_clients": len(CLIENTS)}


@router.get("/health")
async def check_all_clients_health():
    """Check health status of all registered clients"""
    results = []
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        for c in CLIENTS:
            try:
                response = await client.get(f"http://{c['ip']}:{c['port']}/api/health")
                if response.status_code == 200:
                    c['status'] = 'online'
                    c['last_seen'] = time.strftime('%Y-%m-%d %H:%M:%S')
                    results.append({
                        "id": c['id'],
                        "status": "online",
                        "response": response.json()
                    })
                else:
                    c['status'] = 'error'
                    results.append({
                        "id": c['id'],
                        "status": "error",
                        "error": f"HTTP {response.status_code}"
                    })
            except httpx.TimeoutException:
                c['status'] = 'timeout'
                results.append({
                    "id": c['id'],
                    "status": "timeout",
                    "error": "Connection timeout"
                })
            except httpx.ConnectError:
                c['status'] = 'offline'
                results.append({
                    "id": c['id'],
                    "status": "offline",
                    "error": "Could not connect"
                })
            except Exception as e:
                c['status'] = 'error'
                results.append({
                    "id": c['id'],
                    "status": "error",
                    "error": str(e)
                })
    
    online_count = sum(1 for r in results if r['status'] == 'online')
    
    return {
        "results": results,
        "online": online_count,
        "total": len(CLIENTS)
    }


def get_clients():
    """Get the global CLIENTS list"""
    return CLIENTS
