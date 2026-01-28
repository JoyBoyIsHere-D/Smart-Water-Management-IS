"""
Federated Learning Admin Server
This server aggregates data from multiple client devices and coordinates federated learning.

Run with: python server.py
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import numpy as np
import threading
import time
import sys
import os

# Add parent directory to path for shared utilities
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = Flask(__name__)
CORS(app)

# Store registered clients
CLIENTS = []

# Training status
training_status = {
    "is_training": False,
    "current_round": 0,
    "total_rounds": 5,
    "client_metrics": [],
    "global_metrics": None,
    "last_updated": None
}

# ==================== Client Management ====================

@app.route('/api/clients', methods=['GET'])
def list_clients():
    """List all registered clients"""
    return jsonify({
        "clients": CLIENTS,
        "total": len(CLIENTS)
    })

@app.route('/api/clients', methods=['POST'])
def add_client():
    """Register a new client device"""
    data = request.json
    
    if not data.get('ip') or not data.get('id'):
        return jsonify({"error": "IP and ID are required"}), 400
    
    # Check if client already exists
    for client in CLIENTS:
        if client['ip'] == data['ip'] or client['id'] == data['id']:
            return jsonify({"error": "Client already registered"}), 409
    
    new_client = {
        "id": data['id'],
        "ip": data['ip'],
        "port": data.get('port', 5001),
        "status": "unknown",
        "last_seen": None
    }
    
    CLIENTS.append(new_client)
    
    return jsonify({
        "message": "Client registered successfully",
        "client": new_client,
        "total_clients": len(CLIENTS)
    })

@app.route('/api/clients/<client_id>', methods=['DELETE'])
def remove_client(client_id):
    """Remove a client from registry"""
    global CLIENTS
    CLIENTS = [c for c in CLIENTS if c['id'] != client_id]
    return jsonify({"message": "Client removed", "total_clients": len(CLIENTS)})

# ==================== Health Check ====================

@app.route('/api/clients/health', methods=['GET'])
def check_all_clients_health():
    """Check health status of all registered clients"""
    results = []
    
    for client in CLIENTS:
        try:
            response = requests.get(
                f"http://{client['ip']}:{client['port']}/api/health",
                timeout=5
            )
            if response.ok:
                client['status'] = 'online'
                client['last_seen'] = time.strftime('%Y-%m-%d %H:%M:%S')
                results.append({
                    "id": client['id'],
                    "status": "online",
                    "response": response.json()
                })
            else:
                client['status'] = 'error'
                results.append({
                    "id": client['id'],
                    "status": "error",
                    "error": f"HTTP {response.status_code}"
                })
        except requests.exceptions.Timeout:
            client['status'] = 'timeout'
            results.append({
                "id": client['id'],
                "status": "timeout",
                "error": "Connection timeout"
            })
        except requests.exceptions.ConnectionError:
            client['status'] = 'offline'
            results.append({
                "id": client['id'],
                "status": "offline",
                "error": "Could not connect"
            })
        except Exception as e:
            client['status'] = 'error'
            results.append({
                "id": client['id'],
                "status": "error",
                "error": str(e)
            })
    
    online_count = sum(1 for r in results if r['status'] == 'online')
    
    return jsonify({
        "results": results,
        "online": online_count,
        "total": len(CLIENTS)
    })

# ==================== Data Fetching ====================

@app.route('/api/remote-data', methods=['GET'])
def fetch_single_client_data():
    """Fetch data from a specific client"""
    client_ip = request.args.get('ip')
    client_port = request.args.get('port', 5001)
    endpoint = request.args.get('endpoint', '/api/local-data')
    
    if not client_ip:
        return jsonify({"error": "IP address required"}), 400
    
    try:
        response = requests.get(
            f"http://{client_ip}:{client_port}{endpoint}",
            timeout=10
        )
        response.raise_for_status()
        
        return jsonify({
            "source_ip": client_ip,
            "data": response.json(),
            "status": "success"
        })
        
    except requests.exceptions.Timeout:
        return jsonify({"error": "Connection timeout"}), 504
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Could not connect to client"}), 503
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/all-clients-data', methods=['GET'])
def fetch_all_clients_data():
    """Fetch data from all registered clients"""
    results = []
    
    print(f"\n[DEBUG] Fetching data from {len(CLIENTS)} clients...")
    
    for client in CLIENTS:
        try:
            print(f"[DEBUG] Connecting to {client['id']} at {client['ip']}:{client['port']}...")
            response = requests.get(
                f"http://{client['ip']}:{client['port']}/api/local-data",
                timeout=10
            )
            print(f"[DEBUG] Response status: {response.status_code}")
            if response.ok:
                data = response.json()
                data['connection_status'] = 'connected'
                print(f"[DEBUG] Got data from {client['id']}: {len(data.get('latest_readings', []))} readings")
                results.append(data)
            else:
                print(f"[DEBUG] Error from {client['id']}: HTTP {response.status_code}")
                results.append({
                    "client_id": client['id'],
                    "connection_status": 'error',
                    "error": f"HTTP {response.status_code}"
                })
        except Exception as e:
            print(f"[DEBUG] Exception for {client['id']}: {str(e)}")
            results.append({
                "client_id": client['id'],
                "connection_status": 'failed',
                "error": str(e)
            })
    
    # Calculate aggregated statistics
    connected_clients = [r for r in results if r.get('connection_status') == 'connected']
    
    aggregated = None
    if connected_clients:
        total_records = sum(c.get('total_records', 0) for c in connected_clients)
        
        # Average statistics across all clients
        stats_keys = ['avg_pressure', 'avg_flow_rate', 'avg_tds', 'avg_ph', 'avg_temperature']
        aggregated = {
            "total_records": total_records,
            "connected_clients": len(connected_clients)
        }
        
        for key in stats_keys:
            values = [c['statistics'].get(key, 0) for c in connected_clients if 'statistics' in c]
            if values:
                aggregated[key] = sum(values) / len(values)
    
    return jsonify({
        "clients_data": results,
        "total_clients": len(CLIENTS),
        "connected_clients": len(connected_clients),
        "aggregated_statistics": aggregated
    })

# ==================== Model Metrics ====================

@app.route('/api/all-clients-metrics', methods=['GET'])
def fetch_all_clients_metrics():
    """Fetch model metrics from all registered clients"""
    results = []
    
    for client in CLIENTS:
        try:
            response = requests.get(
                f"http://{client['ip']}:{client['port']}/api/model-metrics",
                timeout=10
            )
            if response.ok:
                metrics = response.json()
                metrics['connection_status'] = 'connected'
                results.append(metrics)
            else:
                results.append({
                    "client_id": client['id'],
                    "connection_status": 'error'
                })
        except Exception as e:
            results.append({
                "client_id": client['id'],
                "connection_status": 'failed',
                "error": str(e)
            })
    
    # Calculate average metrics
    connected = [r for r in results if r.get('connection_status') == 'connected']
    avg_metrics = None
    
    if connected:
        avg_metrics = {
            "accuracy": np.mean([r.get('accuracy', 0) for r in connected]),
            "precision": np.mean([r.get('precision', 0) for r in connected]),
            "recall": np.mean([r.get('recall', 0) for r in connected]),
            "f1_score": np.mean([r.get('f1_score', 0) for r in connected])
        }
    
    return jsonify({
        "clients_metrics": results,
        "average_metrics": avg_metrics,
        "connected_clients": len(connected)
    })

# ==================== Federated Training ====================

@app.route('/api/training/status', methods=['GET'])
def get_training_status():
    """Get current federated training status"""
    return jsonify(training_status)

@app.route('/api/training/start', methods=['POST'])
def start_training():
    """Start federated learning training"""
    global training_status
    
    if training_status['is_training']:
        return jsonify({"error": "Training already in progress"}), 400
    
    if len(CLIENTS) == 0:
        return jsonify({"error": "No clients registered"}), 400
    
    data = request.json or {}
    num_rounds = data.get('rounds', 5)
    
    training_status = {
        "is_training": True,
        "current_round": 0,
        "total_rounds": num_rounds,
        "client_metrics": [],
        "global_metrics": None,
        "last_updated": time.strftime('%Y-%m-%d %H:%M:%S')
    }
    
    # Start training in background
    thread = threading.Thread(target=run_federated_training, args=(num_rounds,))
    thread.daemon = True
    thread.start()
    
    return jsonify({
        "message": "Federated training started",
        "rounds": num_rounds,
        "clients": len(CLIENTS)
    })

def run_federated_training(num_rounds):
    """Simulate federated training rounds"""
    global training_status
    
    try:
        for round_num in range(1, num_rounds + 1):
            training_status['current_round'] = round_num
            training_status['last_updated'] = time.strftime('%Y-%m-%d %H:%M:%S')
            
            # Collect metrics from each client
            round_metrics = []
            for client in CLIENTS:
                try:
                    # Trigger local training on client
                    response = requests.post(
                        f"http://{client['ip']}:{client['port']}/api/train",
                        json={"round": round_num},
                        timeout=60
                    )
                    if response.ok:
                        metrics = response.json()
                        round_metrics.append({
                            "client_id": client['id'],
                            "metrics": metrics
                        })
                except Exception as e:
                    round_metrics.append({
                        "client_id": client['id'],
                        "error": str(e)
                    })
            
            training_status['client_metrics'] = round_metrics
            
            # Simulate aggregation delay
            time.sleep(2)
        
        # Training complete
        training_status['is_training'] = False
        training_status['global_metrics'] = {
            "accuracy": 0.85 + np.random.random() * 0.1,
            "precision": 0.82 + np.random.random() * 0.1,
            "recall": 0.80 + np.random.random() * 0.1,
            "f1_score": 0.81 + np.random.random() * 0.1
        }
        training_status['last_updated'] = time.strftime('%Y-%m-%d %H:%M:%S')
        
    except Exception as e:
        training_status['is_training'] = False
        training_status['error'] = str(e)

# ==================== Server Info ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Admin server health check"""
    return jsonify({
        "status": "online",
        "server": "admin",
        "registered_clients": len(CLIENTS),
        "training_active": training_status['is_training']
    })

@app.route('/', methods=['GET'])
def index():
    """API information"""
    return jsonify({
        "name": "Federated Learning Admin Server",
        "version": "1.0.0",
        "endpoints": {
            "GET /api/health": "Server health check",
            "GET /api/clients": "List registered clients",
            "POST /api/clients": "Register new client",
            "DELETE /api/clients/<id>": "Remove client",
            "GET /api/clients/health": "Check all clients health",
            "GET /api/remote-data": "Fetch data from specific client",
            "GET /api/all-clients-data": "Fetch data from all clients",
            "GET /api/all-clients-metrics": "Fetch model metrics from all clients",
            "GET /api/training/status": "Get training status",
            "POST /api/training/start": "Start federated training"
        }
    })

if __name__ == '__main__':
    print("\n" + "="*60)
    print("  FEDERATED LEARNING ADMIN SERVER")
    print("="*60)
    print("\nServer starting on http://0.0.0.0:5000")
    print("\nAvailable endpoints:")
    print("  - GET  /api/health           - Server health check")
    print("  - GET  /api/clients          - List registered clients")
    print("  - POST /api/clients          - Register new client")
    print("  - GET  /api/clients/health   - Check all clients health")
    print("  - GET  /api/all-clients-data - Fetch all clients data")
    print("  - POST /api/training/start   - Start federated training")
    print("\n" + "="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
