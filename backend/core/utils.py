"""
Core utility functions for federated learning server.
"""

import math
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from typing import Optional, Dict, Any
import os

try:
    import tensorflow as tf
    from tensorflow import keras
    from keras.models import Sequential
    from keras.layers import Dense, Dropout
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False


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


def load_and_prepare_data(data_path: str, num_clients: int = 5) -> Optional[Dict[str, Any]]:
    """Load dataset and prepare federated data splits"""
    if not os.path.exists(data_path):
        print(f"Data file not found at {data_path}")
        return None
    
    df = pd.read_csv(data_path)
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
    
    # Get feature columns
    feature_cols = existing_numerical + [col for col in df_encoded.columns 
                                         if any(col.startswith(c) for c in categorical_cols)]
    features = [f for f in feature_cols if f in df_encoded.columns]
    
    X = df_encoded[features].values.astype(np.float32)
    y = df_encoded['unsafe'].values.astype(np.float32)
    
    # Split data among clients
    client_data = {}
    samples_per_client = len(X) // num_clients
    
    for i in range(num_clients):
        start_idx = i * samples_per_client
        if i == num_clients - 1:
            end_idx = len(X)
        else:
            end_idx = (i + 1) * samples_per_client
        
        client_data[f"client_{i+1}"] = {
            "X": X[start_idx:end_idx],
            "y": y[start_idx:end_idx]
        }
    
    return {
        "scaler": scaler,
        "features": features,
        "client_data": client_data,
        "full_data": {"X": X, "y": y}
    }
