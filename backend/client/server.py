"""
Federated Learning Client Server
Run this on each client device/laptop to share local data and participate in federated learning.

IMPORTANT: Change CLIENT_ID and CLIENT_PORT for each device!
- Device 1: CLIENT_ID = "client_1", CLIENT_PORT = 5001
- Device 2: CLIENT_ID = "client_2", CLIENT_PORT = 5002
- Device 3: CLIENT_ID = "client_3", CLIENT_PORT = 5003

Run with: python server.py
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import os
import time

app = Flask(__name__)
CORS(app)

# ==================== CONFIGURATION ====================
# CHANGE THESE FOR EACH CLIENT DEVICE
CLIENT_ID = "client_1"  # Change to client_2, client_3, etc.
CLIENT_PORT = 5001      # Change to 5002, 5003, etc.
DATA_FILE = "data/synthetic_dataset.csv"  # Path to your local data file
# =======================================================

# Global variables
local_data = None
local_model = None
scaler = None
features = None
model_metrics = {
    "accuracy": 0.0,
    "precision": 0.0,
    "recall": 0.0,
    "f1_score": 0.0,
    "last_trained": None
}

def load_local_data():
    """Load and preprocess local dataset"""
    global local_data, scaler, features
    
    # Try multiple possible data file locations
    possible_paths = [
        DATA_FILE,
        "synthetic_dataset.csv",
        "../data/synthetic_dataset.csv",
        "../../data/synthetic_dataset.csv",
        os.path.join(os.path.dirname(__file__), "data", "synthetic_dataset.csv"),
        os.path.join(os.path.dirname(__file__), "..", "..", "data", "synthetic_dataset.csv"),
    ]
    
    data_path = None
    for path in possible_paths:
        if os.path.exists(path):
            data_path = path
            break
    
    if data_path is None:
        print(f"Warning: No data file found. Searched paths: {possible_paths}")
        return None
    
    print(f"Loading data from: {data_path}")
    df = pd.read_csv(data_path)
    
    # Create target variable
    def create_target(row):
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
    
    df['unsafe'] = df.apply(create_target, axis=1)
    
    # Define columns
    numerical_cols = ['pressure_bar', 'flow_rate_L_min', 'total_volume_L', 
                     'tds_ppm', 'ph', 'temperature_C', 'signal_strength_dBm']
    categorical_cols = ['pressure_status', 'tds_status', 'ph_status', 
                       'wifi_status', 'sensor_status']
    
    # Scale numerical features
    scaler = StandardScaler()
    df_scaled = df.copy()
    
    # Only scale if columns exist
    existing_numerical = [c for c in numerical_cols if c in df.columns]
    if existing_numerical:
        df_scaled[existing_numerical] = scaler.fit_transform(df[existing_numerical])
    
    # Encode categorical
    existing_categorical = [c for c in categorical_cols if c in df.columns]
    if existing_categorical:
        df_encoded = pd.get_dummies(df_scaled, columns=existing_categorical, drop_first=True)
    else:
        df_encoded = df_scaled
    
    # Define features
    feature_cols = existing_numerical + [col for col in df_encoded.columns 
                                         if any(col.startswith(c) for c in categorical_cols)]
    features = [f for f in feature_cols if f in df_encoded.columns]
    
    X = df_encoded[features].values.astype(np.float32)
    y = df_encoded['unsafe'].values.astype(np.float32)
    
    local_data = {
        "X": X,
        "y": y,
        "df": df,
        "features": features
    }
    
    return local_data

# ==================== API Endpoints ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Client health check"""
    return jsonify({
        "status": "online",
        "client_id": CLIENT_ID,
        "port": CLIENT_PORT,
        "data_loaded": local_data is not None,
        "model_trained": model_metrics['last_trained'] is not None
    })

@app.route('/api/local-data', methods=['GET'])
def get_local_data():
    """Return local water quality data summary"""
    if local_data is None:
        return jsonify({
            "client_id": CLIENT_ID,
            "error": "No data loaded"
        }), 404
    
    df = local_data['df']
    
    # Get latest readings (last 10 records)
    latest = df.tail(10).to_dict(orient='records')
    
    # Calculate statistics
    statistics = {}
    stat_columns = {
        'pressure_bar': 'avg_pressure',
        'flow_rate_L_min': 'avg_flow_rate',
        'tds_ppm': 'avg_tds',
        'ph': 'avg_ph',
        'temperature_C': 'avg_temperature'
    }
    
    for col, stat_name in stat_columns.items():
        if col in df.columns:
            statistics[stat_name] = float(df[col].mean())
    
    # Quality distribution
    unsafe_count = int(df['unsafe'].sum())
    safe_count = len(df) - unsafe_count
    
    return jsonify({
        "client_id": CLIENT_ID,
        "total_records": len(df),
        "latest_readings": latest,
        "statistics": statistics,
        "quality_distribution": {
            "safe": safe_count,
            "unsafe": unsafe_count,
            "unsafe_percentage": round(unsafe_count / len(df) * 100, 2)
        }
    })

@app.route('/api/model-metrics', methods=['GET'])
def get_model_metrics():
    """Return local model performance metrics"""
    return jsonify({
        "client_id": CLIENT_ID,
        **model_metrics
    })

@app.route('/api/train', methods=['POST'])
def train_local_model():
    """Train the local model (called by admin during federated learning)"""
    global model_metrics
    
    if local_data is None:
        return jsonify({"error": "No data loaded"}), 400
    
    try:
        # Simulate training (in production, this would train an actual model)
        data = request.json or {}
        round_num = data.get('round', 1)
        
        # Simulate training delay
        time.sleep(1)
        
        # Simulate metrics improvement over rounds
        base_accuracy = 0.75 + (round_num * 0.02)
        noise = np.random.random() * 0.05
        
        model_metrics = {
            "accuracy": min(0.95, base_accuracy + noise),
            "precision": min(0.93, base_accuracy - 0.02 + noise),
            "recall": min(0.91, base_accuracy - 0.05 + noise),
            "f1_score": min(0.92, base_accuracy - 0.03 + noise),
            "last_trained": time.strftime('%Y-%m-%d %H:%M:%S'),
            "training_round": round_num
        }
        
        return jsonify({
            "client_id": CLIENT_ID,
            "status": "training_complete",
            "round": round_num,
            "metrics": model_metrics
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/weights', methods=['GET'])
def get_model_weights():
    """Return current model weights (for federated averaging)"""
    # In production, this would return actual model weights
    return jsonify({
        "client_id": CLIENT_ID,
        "weights": "placeholder",
        "message": "Implement actual weight extraction here"
    })

@app.route('/api/weights', methods=['POST'])
def set_model_weights():
    """Update model with global weights (from federated server)"""
    # In production, this would set actual model weights
    return jsonify({
        "client_id": CLIENT_ID,
        "status": "weights_updated",
        "message": "Implement actual weight update here"
    })

@app.route('/', methods=['GET'])
def index():
    """Client API information"""
    return jsonify({
        "name": f"Federated Learning Client - {CLIENT_ID}",
        "version": "1.0.0",
        "endpoints": {
            "GET /api/health": "Client health check",
            "GET /api/local-data": "Get local data summary",
            "GET /api/model-metrics": "Get model metrics",
            "POST /api/train": "Trigger local training",
            "GET /api/weights": "Get model weights",
            "POST /api/weights": "Update model weights"
        }
    })

if __name__ == '__main__':
    print("\n" + "="*60)
    print(f"  FEDERATED LEARNING CLIENT: {CLIENT_ID}")
    print("="*60)
    
    # Load data on startup
    print(f"\nSearching for data file...")
    load_local_data()
    
    if local_data is not None:
        print(f"✓ Loaded {len(local_data['df'])} records")
        print(f"✓ Features: {len(local_data['features'])}")
    else:
        print("✗ No data loaded - place synthetic_dataset.csv in data/ folder")
    
    print(f"\nClient server starting on http://0.0.0.0:{CLIENT_PORT}")
    print("\nTo register with admin server, use:")
    print(f'  IP: <your-ip-address>')
    print(f'  Port: {CLIENT_PORT}')
    print(f'  Client ID: {CLIENT_ID}')
    print("\n" + "="*60 + "\n")
    
    app.run(host='0.0.0.0', port=CLIENT_PORT, debug=True)
