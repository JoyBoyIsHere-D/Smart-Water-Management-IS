"""
Federated Learning Admin Server (FastAPI)
This server aggregates data from multiple client devices and coordinates federated learning.

Run with: uvicorn server:app --host 0.0.0.0 --port 5000 --reload
Or: python server.py
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import httpx
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score, precision_score, recall_score, f1_score
import asyncio
import time
import sys
import os
import json
import math

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import authentication
try:
    from auth.routes import router as auth_router
    from auth.jwt_handler import get_current_user, get_optional_user
    from auth.database import ensure_tables, close_pool, check_database_health
    from config import settings, validate_settings
    AUTH_AVAILABLE = True
        
except ImportError as e:
    print(f"Warning: Auth module not available: {e}")
    AUTH_AVAILABLE = False
    
    # Dummy functions when auth not available
    async def get_current_user():
        return {"id": "anonymous", "email": "anonymous@example.com"}
    
    async def get_optional_user():
        return None
    
    async def ensure_tables():
        pass
    
    async def close_pool():
        pass
    
    async def check_database_health():
        return False

# TensorFlow/Keras imports
try:
    import tensorflow as tf
    from tensorflow import keras
    from keras.models import Sequential, load_model
    from keras.layers import Dense, Dropout
    from keras.callbacks import EarlyStopping
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("Warning: TensorFlow not available. Model training will be simulated.")

app = FastAPI(
    title="Federated Learning Admin Server",
    version="2.0.0",
    description="Aggregates data from multiple client devices and coordinates federated learning with real model training"
)

# Include auth routes
if AUTH_AVAILABLE:
    app.include_router(auth_router)

    @app.on_event("startup")
    async def startup_db():
        """Initialize PostgreSQL pool and ensure tables exist on startup."""
        try:
            await ensure_tables()
            print("\u2705 PostgreSQL ready")
        except Exception as e:
            print(f"\u26a0\ufe0f  PostgreSQL startup error: {e}")

    @app.on_event("shutdown")
    async def shutdown_db():
        await close_pool()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store registered clients
CLIENTS: List[Dict[str, Any]] = []

# Training status
training_status = {
    "is_training": False,
    "current_round": 0,
    "total_rounds": 5,
    "client_metrics": [],
    "global_metrics": None,
    "last_updated": None,
    "round_history": []
}

# Global model and data storage
global_model = None
global_weights = None
client_data = {}
scaler = None
features = []
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "federated_water_quality_model.h5")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "water_quality_scaler.pkl")
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "synthetic_dataset.csv")

# ==================== Helper Functions ====================

def clean_for_json(obj):
    """Convert NaN and Inf values to None for JSON serialization"""
    if isinstance(obj, dict):
        return {k: clean_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_for_json(item) for item in obj]
    elif isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    elif isinstance(obj, np.floating):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return float(obj)
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.ndarray):
        return clean_for_json(obj.tolist())
    elif pd.isna(obj):
        return None
    return obj

def create_model(input_shape: int):
    """Create a neural network model for water quality prediction"""
    if not TF_AVAILABLE:
        return None
    
    model = Sequential([
        Dense(32, activation='relu', input_shape=(input_shape,),
              kernel_regularizer=tf.keras.regularizers.l2(0.01)),
        Dropout(0.3),
        Dense(16, activation='relu',
              kernel_regularizer=tf.keras.regularizers.l2(0.01)),
        Dropout(0.3),
        Dense(8, activation='relu',
              kernel_regularizer=tf.keras.regularizers.l2(0.01)),
        Dropout(0.2),
        Dense(1, activation='sigmoid')
    ])
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='binary_crossentropy',
        metrics=['accuracy', tf.keras.metrics.Precision(), tf.keras.metrics.Recall()]
    )
    return model

def create_target(row):
    """Create target variable: 1 if unsafe, 0 if safe"""
    if pd.notna(row.get('alert')):
        return 1
    if row.get('pressure_status') in ['High', 'Low']:
        return 1
    if row.get('tds_status') == 'Poor':
        return 1
    if row.get('ph_status') in ['Acidic', 'Alkaline']:
        return 1
    if row.get('sensor_status') == 'Fault':
        return 1
    return 0

def load_and_prepare_data(num_clients: int = 5):
    """Load dataset and prepare federated data splits"""
    global scaler, features, client_data
    
    if not os.path.exists(DATA_PATH):
        print(f"Data file not found at {DATA_PATH}")
        return None
    
    df = pd.read_csv(DATA_PATH)
    df['unsafe'] = df.apply(create_target, axis=1)
    
    # Define columns
    numerical_cols = ['pressure_bar', 'flow_rate_L_min', 'total_volume_L', 
                     'tds_ppm', 'ph', 'temperature_C', 'signal_strength_dBm']
    categorical_cols = ['pressure_status', 'tds_status', 'ph_status', 
                       'wifi_status', 'sensor_status']
    
    # Scale numerical features
    scaler = StandardScaler()
    existing_numerical = [c for c in numerical_cols if c in df.columns]
    df[existing_numerical] = scaler.fit_transform(df[existing_numerical])
    
    # Encode categorical variables
    existing_categorical = [c for c in categorical_cols if c in df.columns]
    df_encoded = pd.get_dummies(df, columns=existing_categorical, drop_first=True)
    
    # Features list
    features = existing_numerical + [col for col in df_encoded.columns 
                                     if any(col.startswith(c) for c in categorical_cols)]
    features = [f for f in features if f in df_encoded.columns]
    
    # Shuffle and split data for clients
    df_shuffled = df_encoded.sample(frac=1, random_state=42).reset_index(drop=True)
    samples_per_client = len(df_shuffled) // num_clients
    
    client_data = {}
    for i in range(num_clients):
        start_idx = i * samples_per_client
        end_idx = (i + 1) * samples_per_client if i < num_clients - 1 else len(df_shuffled)
        client_df = df_shuffled.iloc[start_idx:end_idx]
        
        X = client_df[features]
        y = client_df['unsafe']
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, 
            stratify=y if len(y.unique()) > 1 else None
        )
        
        client_data[f'client_{i}'] = {
            'X_train': X_train.values.astype(np.float32),
            'X_test': X_test.values.astype(np.float32),
            'y_train': y_train.values.astype(np.float32),
            'y_test': y_test.values.astype(np.float32)
        }
    
    print(f"✓ Prepared federated data for {num_clients} clients")
    print(f"✓ Features: {len(features)}")
    print(f"✓ Total samples: {len(df_shuffled)}")
    
    return client_data

# ==================== Pydantic Models ====================

class ClientCreate(BaseModel):
    id: str
    ip: str
    port: int = 5001

class TrainingConfig(BaseModel):
    rounds: int = 5
    epochs_per_round: int = 20
    batch_size: int = 32
    num_clients: int = 5

class PredictionInput(BaseModel):
    pressure_bar: float
    flow_rate_L_min: float
    total_volume_L: float
    tds_ppm: float
    ph: float
    temperature_C: float
    signal_strength_dBm: float
    pressure_status: str = "Normal"
    tds_status: str = "Good"
    ph_status: str = "Neutral"
    wifi_status: str = "Connected"
    sensor_status: str = "Normal"

# ==================== Client Management ====================

@app.get("/api/clients")
async def list_clients():
    """List all registered clients"""
    return {
        "clients": CLIENTS,
        "total": len(CLIENTS)
    }

@app.post("/api/clients")
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

@app.delete("/api/clients/{client_id}")
async def remove_client(client_id: str):
    """Remove a client from registry"""
    global CLIENTS
    CLIENTS = [c for c in CLIENTS if c['id'] != client_id]
    return {"message": "Client removed", "total_clients": len(CLIENTS)}

# ==================== Health Check ====================

@app.get("/api/clients/health")
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

# ==================== Data Fetching ====================

@app.get("/api/remote-data")
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

@app.get("/api/all-clients-data")
async def fetch_all_clients_data():
    """Fetch data from all registered clients"""
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

# ==================== Model Metrics ====================

@app.get("/api/all-clients-metrics")
async def fetch_all_clients_metrics():
    """Fetch model metrics from all registered clients"""
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

# ==================== Federated Training ====================

@app.get("/api/training/status")
async def get_training_status():
    """Get current federated training status"""
    return clean_for_json(training_status)

@app.get("/api/training/history")
async def get_training_history():
    """Get history of all training rounds"""
    return clean_for_json({
        "round_history": training_status.get('round_history', []),
        "total_rounds_completed": len(training_status.get('round_history', [])),
        "global_metrics": training_status.get('global_metrics')
    })

async def run_federated_training(num_rounds: int, epochs_per_round: int, batch_size: int, num_clients: int):
    """Run actual federated learning training rounds"""
    global training_status, global_model, global_weights, client_data
    
    try:
        # Load and prepare data
        print(f"\n[FEDERATED] Starting federated learning with {num_clients} clients...")
        data = load_and_prepare_data(num_clients)
        
        if data is None:
            training_status['is_training'] = False
            training_status['error'] = "Failed to load training data"
            return
        
        if not TF_AVAILABLE:
            # Simulate training if TensorFlow not available
            await run_simulated_training(num_rounds)
            return
        
        # Initialize global model
        input_shape = len(features)
        global_model = create_model(input_shape)
        global_weights = global_model.get_weights()
        
        training_status['round_history'] = []
        
        for round_num in range(1, num_rounds + 1):
            print(f"\n--- Federated Round {round_num}/{num_rounds} ---")
            training_status['current_round'] = round_num
            training_status['last_updated'] = time.strftime('%Y-%m-%d %H:%M:%S')
            
            # Train on each client and collect weights
            client_weights_list = []
            round_metrics = []
            
            for client_id, data in client_data.items():
                # Create local model and set global weights
                local_model = create_model(input_shape)
                local_model.set_weights(global_weights)
                
                # Local training with early stopping
                early_stop = EarlyStopping(
                    monitor='val_loss', 
                    patience=5, 
                    restore_best_weights=True,
                    min_delta=0.001
                )
                
                history = local_model.fit(
                    data['X_train'], data['y_train'],
                    epochs=epochs_per_round,
                    batch_size=batch_size,
                    validation_split=0.2,
                    callbacks=[early_stop],
                    verbose=0
                )
                
                # Collect weights
                client_weights_list.append(local_model.get_weights())
                
                # Evaluate locally
                loss, accuracy, precision, recall = local_model.evaluate(
                    data['X_test'], data['y_test'], verbose=0
                )
                f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
                
                metrics = {
                    'client_id': client_id,
                    'accuracy': float(accuracy),
                    'precision': float(precision),
                    'recall': float(recall),
                    'f1_score': float(f1),
                    'loss': float(loss)
                }
                round_metrics.append(metrics)
                print(f"  {client_id}: Acc={accuracy:.4f}, Prec={precision:.4f}, Rec={recall:.4f}, F1={f1:.4f}")
            
            # Federated Averaging
            new_weights = []
            for layer_weights in zip(*client_weights_list):
                avg_weights = np.mean(layer_weights, axis=0)
                new_weights.append(avg_weights)
            
            # Update global model
            global_weights = new_weights
            global_model.set_weights(global_weights)
            
            # Calculate round averages
            avg_metrics = {
                'accuracy': float(np.mean([m['accuracy'] for m in round_metrics])),
                'precision': float(np.mean([m['precision'] for m in round_metrics])),
                'recall': float(np.mean([m['recall'] for m in round_metrics])),
                'f1_score': float(np.mean([m['f1_score'] for m in round_metrics])),
                'loss': float(np.mean([m['loss'] for m in round_metrics]))
            }
            
            # Store round history
            training_status['round_history'].append({
                'round': round_num,
                'client_metrics': round_metrics,
                'average_metrics': avg_metrics,
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
            })
            
            training_status['client_metrics'] = round_metrics
            print(f"  Round {round_num} average: Acc={avg_metrics['accuracy']:.4f}, F1={avg_metrics['f1_score']:.4f}")
            
            # Small delay between rounds
            await asyncio.sleep(0.5)
        
        # Final evaluation on combined test set
        all_X_test = np.concatenate([client_data[c]['X_test'] for c in client_data.keys()])
        all_y_test = np.concatenate([client_data[c]['y_test'] for c in client_data.keys()])
        
        loss, accuracy, precision, recall = global_model.evaluate(all_X_test, all_y_test, verbose=0)
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        training_status['global_metrics'] = {
            'accuracy': float(accuracy),
            'precision': float(precision),
            'recall': float(recall),
            'f1_score': float(f1),
            'loss': float(loss),
            'total_test_samples': len(all_y_test)
        }
        
        # Save the trained model
        global_model.save(MODEL_PATH)
        print(f"\n✓ Model saved to {MODEL_PATH}")
        
        # Save scaler
        import joblib
        joblib.dump(scaler, SCALER_PATH)
        print(f"✓ Scaler saved to {SCALER_PATH}")
        
        training_status['is_training'] = False
        training_status['last_updated'] = time.strftime('%Y-%m-%d %H:%M:%S')
        print(f"\n✓ Federated learning completed! Final Accuracy: {accuracy:.4f}, F1: {f1:.4f}")
        
    except Exception as e:
        import traceback
        print(f"Training error: {str(e)}")
        traceback.print_exc()
        training_status['is_training'] = False
        training_status['error'] = str(e)

async def run_simulated_training(num_rounds: int):
    """Simulate training when TensorFlow is not available"""
    global training_status
    
    training_status['round_history'] = []
    
    for round_num in range(1, num_rounds + 1):
        training_status['current_round'] = round_num
        training_status['last_updated'] = time.strftime('%Y-%m-%d %H:%M:%S')
        
        # Simulate improving metrics
        base = 0.70 + (round_num * 0.04)
        noise = np.random.random() * 0.03
        
        round_metrics = []
        for i in range(5):
            metrics = {
                'client_id': f'client_{i}',
                'accuracy': float(min(0.95, base + noise)),
                'precision': float(min(0.93, base - 0.02 + noise)),
                'recall': float(min(0.91, base - 0.05 + noise)),
                'f1_score': float(min(0.92, base - 0.03 + noise)),
                'loss': float(max(0.1, 0.5 - round_num * 0.08))
            }
            round_metrics.append(metrics)
        
        avg_metrics = {k: float(np.mean([m[k] for m in round_metrics])) for k in round_metrics[0].keys() if k != 'client_id'}
        
        training_status['round_history'].append({
            'round': round_num,
            'client_metrics': round_metrics,
            'average_metrics': avg_metrics,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        })
        
        training_status['client_metrics'] = round_metrics
        await asyncio.sleep(2)
    
    training_status['is_training'] = False
    training_status['global_metrics'] = {
        'accuracy': float(0.88 + np.random.random() * 0.07),
        'precision': float(0.85 + np.random.random() * 0.08),
        'recall': float(0.83 + np.random.random() * 0.10),
        'f1_score': float(0.84 + np.random.random() * 0.09),
        'loss': float(0.15 + np.random.random() * 0.05)
    }
    training_status['last_updated'] = time.strftime('%Y-%m-%d %H:%M:%S')

@app.post("/api/training/start")
async def start_training(config: TrainingConfig, background_tasks: BackgroundTasks):
    """Start federated learning training"""
    global training_status
    
    if training_status['is_training']:
        raise HTTPException(status_code=400, detail="Training already in progress")
    
    training_status = {
        "is_training": True,
        "current_round": 0,
        "total_rounds": config.rounds,
        "client_metrics": [],
        "global_metrics": None,
        "last_updated": time.strftime('%Y-%m-%d %H:%M:%S'),
        "round_history": [],
        "config": {
            "rounds": config.rounds,
            "epochs_per_round": config.epochs_per_round,
            "batch_size": config.batch_size,
            "num_clients": config.num_clients
        }
    }
    
    background_tasks.add_task(
        run_federated_training, 
        config.rounds, 
        config.epochs_per_round, 
        config.batch_size,
        config.num_clients
    )
    
    return {
        "message": "Federated training started",
        "config": training_status['config'],
        "tensorflow_available": TF_AVAILABLE
    }

@app.post("/api/training/stop")
async def stop_training():
    """Stop ongoing training"""
    global training_status
    
    if not training_status['is_training']:
        raise HTTPException(status_code=400, detail="No training in progress")
    
    training_status['is_training'] = False
    training_status['last_updated'] = time.strftime('%Y-%m-%d %H:%M:%S')
    
    return {"message": "Training stopped", "completed_rounds": training_status['current_round']}

# ==================== Model Endpoints ====================

@app.get("/api/model/info")
async def get_model_info():
    """Get information about the current global model"""
    model_exists = os.path.exists(MODEL_PATH)
    
    info = {
        "model_path": MODEL_PATH,
        "model_exists": model_exists,
        "tensorflow_available": TF_AVAILABLE,
        "features_count": len(features),
        "features": features[:10] if features else [],  # First 10 features
        "global_metrics": training_status.get('global_metrics')
    }
    
    if model_exists and TF_AVAILABLE:
        try:
            model = load_model(MODEL_PATH)
            info['model_summary'] = {
                "layers": len(model.layers),
                "total_params": int(model.count_params()),
                "input_shape": model.input_shape[1] if model.input_shape else None
            }
        except Exception as e:
            info['model_load_error'] = str(e)
    
    return clean_for_json(info)

@app.get("/api/model/download")
async def download_model():
    """Download the trained model file"""
    if not os.path.exists(MODEL_PATH):
        raise HTTPException(status_code=404, detail="Model file not found. Train the model first.")
    
    return FileResponse(
        MODEL_PATH,
        media_type='application/octet-stream',
        filename='federated_water_quality_model.h5'
    )

@app.post("/api/model/predict")
async def predict_water_quality(data: PredictionInput):
    """Make a prediction using the trained model"""
    global global_model, scaler
    
    if not TF_AVAILABLE:
        # Return simulated prediction
        risk_score = np.random.random()
        return {
            "prediction": "Unsafe" if risk_score > 0.5 else "Safe",
            "unsafe_probability": float(risk_score),
            "safe_probability": float(1 - risk_score),
            "simulated": True
        }
    
    # Load model if not in memory
    if global_model is None:
        if os.path.exists(MODEL_PATH):
            global_model = load_model(MODEL_PATH)
        else:
            raise HTTPException(status_code=404, detail="Model not trained yet")
    
    # Load scaler if not in memory
    if scaler is None:
        if os.path.exists(SCALER_PATH):
            import joblib
            scaler = joblib.load(SCALER_PATH)
        else:
            raise HTTPException(status_code=404, detail="Scaler not found")
    
    try:
        # Prepare input data
        numerical_values = np.array([[
            data.pressure_bar, data.flow_rate_L_min, data.total_volume_L,
            data.tds_ppm, data.ph, data.temperature_C, data.signal_strength_dBm
        ]])
        
        # Scale numerical values
        scaled_values = scaler.transform(numerical_values)
        
        # For now, use only numerical features for prediction
        # In production, you'd also encode categorical features
        prediction_prob = float(global_model.predict(scaled_values, verbose=0)[0][0])
        prediction = "Unsafe" if prediction_prob > 0.5 else "Safe"
        
        return {
            "prediction": prediction,
            "unsafe_probability": prediction_prob,
            "safe_probability": 1 - prediction_prob,
            "risk_level": "High" if prediction_prob > 0.7 else "Medium" if prediction_prob > 0.3 else "Low"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/statistics")
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

# ==================== Server Info ====================

@app.get("/api/health")
async def health_check():
    """Admin server health check"""
    return {
        "status": "online",
        "server": "admin",
        "registered_clients": len(CLIENTS),
        "training_active": training_status['is_training'],
        "auth_available": AUTH_AVAILABLE
    }

@app.get("/")
async def index():
    """API information"""
    return {
        "name": "Federated Learning Admin Server",
        "version": "2.0.0",
        "framework": "FastAPI",
        "tensorflow_available": TF_AVAILABLE,
        "auth_available": AUTH_AVAILABLE,
        "endpoints": {
            "Authentication": {
                "POST /api/auth/register": "Register new user",
                "POST /api/auth/login": "Login with email/password",
                "POST /api/auth/refresh": "Refresh access token",
                "POST /api/auth/logout": "Logout user",
                "GET /api/auth/me": "Get current user info",
                "PUT /api/auth/profile": "Update user profile",
                "POST /api/auth/password-reset": "Request password reset",
                "POST /api/auth/password-update": "Update password",
                "GET /api/auth/verify": "Verify token validity"
            },
            "Client Management": {
                "GET /api/clients": "List registered clients",
                "POST /api/clients": "Register new client",
                "DELETE /api/clients/{id}": "Remove client",
                "GET /api/clients/health": "Check all clients health"
            },
            "Data": {
                "GET /api/remote-data": "Fetch data from specific client",
                "GET /api/all-clients-data": "Fetch data from all clients",
                "GET /api/all-clients-metrics": "Fetch model metrics from all clients",
                "GET /api/data/statistics": "Get training data statistics"
            },
            "Federated Training": {
                "GET /api/training/status": "Get training status",
                "GET /api/training/history": "Get training round history",
                "POST /api/training/start": "Start federated training",
                "POST /api/training/stop": "Stop ongoing training"
            },
            "Model": {
                "GET /api/model/info": "Get model information",
                "GET /api/model/download": "Download trained model",
                "POST /api/model/predict": "Make water quality prediction"
            },
            "Health": {
                "GET /api/health": "Server health check"
            }
        }
    }

if __name__ == '__main__':
    import uvicorn
    
    print("\n" + "="*60)
    print("  FEDERATED LEARNING ADMIN SERVER v2.0 (FastAPI)")
    print("="*60)
    print(f"\n  TensorFlow available: {TF_AVAILABLE}")
    print(f"  Auth available: {AUTH_AVAILABLE}")
    if AUTH_AVAILABLE:
        print(f"  Database: PostgreSQL (via asyncpg)")
    print(f"  Data path: {DATA_PATH}")
    print(f"  Model path: {MODEL_PATH}")
    
    # Validate settings if auth is available
    if AUTH_AVAILABLE:
        validate_settings()
    
    print("\nServer starting on http://0.0.0.0:5000")
    print("\nAPI Endpoints:")
    print("  Authentication:")
    print("    - POST /api/auth/register    - Register new user")
    print("    - POST /api/auth/login       - Login")
    print("    - POST /api/auth/refresh     - Refresh token")
    print("    - GET  /api/auth/me          - Get current user")
    print("\n  Client Management:")
    print("    - GET  /api/clients          - List clients")
    print("    - POST /api/clients          - Register client")
    print("    - GET  /api/clients/health   - Check clients health")
    print("\n  Federated Training:")
    print("    - POST /api/training/start   - Start training")
    print("    - GET  /api/training/status  - Training status")
    print("    - GET  /api/training/history - Round history")
    print("\n  Model:")
    print("    - GET  /api/model/info       - Model information")
    print("    - POST /api/model/predict    - Make prediction")
    print("    - GET  /api/model/download   - Download model")
    print("\n  Data:")
    print("    - GET  /api/data/statistics  - Dataset statistics")
    print("    - GET  /api/all-clients-data - All clients data")
    print("\n" + "="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=5000)
