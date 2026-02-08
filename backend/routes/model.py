"""
Model operation routes.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
import numpy as np
import os

from core.utils import clean_for_json

router = APIRouter(prefix="/api/model", tags=["Model"])

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "federated_water_quality_model.h5")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "water_quality_scaler.pkl")

# Module-level variables
_global_model = None
_scaler = None
_features = []


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


def set_model_data(model, scaler, features):
    """Set global model, scaler, and features"""
    global _global_model, _scaler, _features
    _global_model = model
    _scaler = scaler
    _features = features


def get_model_data():
    """Get global model, scaler, and features"""
    return _global_model, _scaler, _features


@router.get("/info")
async def get_model_info():
    """Get information about the current global model"""
    try:
        import tensorflow as tf
        from keras.models import load_model
        TF_AVAILABLE = True
    except ImportError:
        TF_AVAILABLE = False
    
    model_exists = os.path.exists(MODEL_PATH)
    global_model, _, features = get_model_data()
    
    info = {
        "model_path": MODEL_PATH,
        "model_exists": model_exists,
        "tensorflow_available": TF_AVAILABLE,
        "features_count": len(features),
        "features": features[:10] if features else [],
        "global_metrics": None  # Will be set by training module
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


@router.get("/download")
async def download_model():
    """Download the trained model file"""
    if not os.path.exists(MODEL_PATH):
        raise HTTPException(
            status_code=404, 
            detail="Model file not found. Train the model first."
        )
    
    return FileResponse(
        MODEL_PATH,
        media_type='application/octet-stream',
        filename='federated_water_quality_model.h5'
    )


@router.post("/predict")
async def predict_water_quality(data: PredictionInput):
    """Make a prediction using the trained model"""
    try:
        import tensorflow as tf
        from keras.models import load_model
        TF_AVAILABLE = True
    except ImportError:
        TF_AVAILABLE = False
    
    global_model, scaler, features = get_model_data()
    
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
            set_model_data(global_model, scaler, features)
        else:
            raise HTTPException(status_code=404, detail="Model not trained yet")
    
    # Load scaler if not in memory
    if scaler is None:
        if os.path.exists(SCALER_PATH):
            import joblib
            scaler = joblib.load(SCALER_PATH)
            set_model_data(global_model, scaler, features)
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
        
        # Make prediction
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
