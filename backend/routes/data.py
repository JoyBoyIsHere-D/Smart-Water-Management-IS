"""
Data fetching and statistics routes.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import httpx
import pandas as pd
import os

from core.utils import create_target, clean_for_json
from routes.clients import get_clients

router = APIRouter(prefix="/api", tags=["Data"])

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "synthetic_dataset.csv")


@router.get("/remote-data")
async def fetch_single_client_data(ip: str, port: int = 5001, endpoint: str = "/api/local-data"):
    """Fetch data from a specific client"""
    if not ip:
        raise HTTPException(status_code=400, detail="IP address required")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"http://{ip}:{port}{endpoint}")
            response.raise_for_status()
            
            return {
                "source_ip": ip,
                "data": response.json(),
                "status": "success"
            }
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Connection timeout")
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Could not connect to client")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/all-clients-data")
async def fetch_all_clients_data():
    """Fetch data from all registered clients"""
    CLIENTS = get_clients()
    results = []
    
    print(f"\n[DEBUG] Fetching data from {len(CLIENTS)} clients...")
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        for c in CLIENTS:
            try:
                print(f"[DEBUG] Connecting to {c['id']} at {c['ip']}:{c['port']}...")
                response = await client.get(f"http://{c['ip']}:{c['port']}/api/local-data")
                print(f"[DEBUG] Response status: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    data['connection_status'] = 'connected'
                    print(f"[DEBUG] Got data from {c['id']}: {len(data.get('latest_readings', []))} readings")
                    results.append(data)
                else:
                    print(f"[DEBUG] Error from {c['id']}: HTTP {response.status_code}")
                    results.append({
                        "client_id": c['id'],
                        "connection_status": 'error',
                        "error": f"HTTP {response.status_code}"
                    })
            except Exception as e:
                print(f"[DEBUG] Exception for {c['id']}: {str(e)}")
                results.append({
                    "client_id": c['id'],
                    "connection_status": 'failed',
                    "error": str(e)
                })
    
    # Calculate aggregated statistics
    connected_clients = [r for r in results if r.get('connection_status') == 'connected']
    
    aggregated = None
    if connected_clients:
        total_records = sum(c.get('total_records', 0) for c in connected_clients)
        
        stats_keys = ['avg_pressure', 'avg_flow_rate', 'avg_tds', 'avg_ph', 'avg_temperature']
        aggregated = {
            "total_records": total_records,
            "connected_clients": len(connected_clients)
        }
        
        for key in stats_keys:
            values = [c['statistics'].get(key, 0) for c in connected_clients if 'statistics' in c]
            if values:
                aggregated[key] = sum(values) / len(values)
    
    return {
        "clients_data": results,
        "total_clients": len(CLIENTS),
        "connected_clients": len(connected_clients),
        "aggregated_statistics": aggregated
    }


@router.get("/all-clients-metrics")
async def fetch_all_clients_metrics():
    """Fetch model metrics from all registered clients"""
    import numpy as np
    
    CLIENTS = get_clients()
    results = []
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        for c in CLIENTS:
            try:
                response = await client.get(f"http://{c['ip']}:{c['port']}/api/model-metrics")
                if response.status_code == 200:
                    metrics = response.json()
                    metrics['connection_status'] = 'connected'
                    results.append(metrics)
                else:
                    results.append({
                        "client_id": c['id'],
                        "connection_status": 'error'
                    })
            except Exception as e:
                results.append({
                    "client_id": c['id'],
                    "connection_status": 'failed',
                    "error": str(e)
                })
    
    # Calculate average metrics
    connected = [r for r in results if r.get('connection_status') == 'connected']
    avg_metrics = None
    
    if connected:
        avg_metrics = {
            "accuracy": float(np.mean([r.get('accuracy', 0) for r in connected])),
            "precision": float(np.mean([r.get('precision', 0) for r in connected])),
            "recall": float(np.mean([r.get('recall', 0) for r in connected])),
            "f1_score": float(np.mean([r.get('f1_score', 0) for r in connected]))
        }
    
    return {
        "clients_metrics": results,
        "average_metrics": avg_metrics,
        "connected_clients": len(connected)
    }


@router.get("/data/statistics")
async def get_data_statistics():
    """Get statistics about the training data"""
    if not os.path.exists(DATA_PATH):
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        df = pd.read_csv(DATA_PATH)
        df['unsafe'] = df.apply(create_target, axis=1)
        
        stats = {
            "total_records": len(df),
            "safe_count": int((df['unsafe'] == 0).sum()),
            "unsafe_count": int((df['unsafe'] == 1).sum()),
            "unsafe_percentage": float(df['unsafe'].mean() * 100),
            "columns": list(df.columns),
            "numerical_stats": {}
        }
        
        numerical_cols = ['pressure_bar', 'flow_rate_L_min', 'total_volume_L', 
                         'tds_ppm', 'ph', 'temperature_C', 'signal_strength_dBm']
        
        for col in numerical_cols:
            if col in df.columns:
                stats['numerical_stats'][col] = {
                    "mean": float(df[col].mean()),
                    "std": float(df[col].std()),
                    "min": float(df[col].min()),
                    "max": float(df[col].max())
                }
        
        return clean_for_json(stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
