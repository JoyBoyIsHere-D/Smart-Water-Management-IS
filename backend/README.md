# Federated Learning Backend

This directory contains the backend servers for the Federated Learning system.

## Structure

```
backend/
├── admin/              # Admin server (run on your main laptop)
│   └── server.py
├── client/             # Client server (copy to other devices)
│   └── server.py
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Admin Laptop Setup

```bash
cd backend/admin
python server.py
```

The admin server will start on `http://localhost:5000`

### 3. Client Laptop Setup

Copy the following to each client laptop:
- `backend/client/` folder
- `data/synthetic_dataset.csv` file

On each client, edit `server.py` to set unique identifiers:

**Client 1:**
```python
CLIENT_ID = "client_1"
CLIENT_PORT = 5001
```

**Client 2:**
```python
CLIENT_ID = "client_2"
CLIENT_PORT = 5002
```

**Client 3:**
```python
CLIENT_ID = "client_3"
CLIENT_PORT = 5003
```

Then run:
```bash
cd backend/client
python server.py
```

## API Endpoints

### Admin Server (Port 5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/clients` | List registered clients |
| POST | `/api/clients` | Register new client |
| DELETE | `/api/clients/<id>` | Remove client |
| GET | `/api/clients/health` | Check all clients health |
| GET | `/api/remote-data` | Fetch data from specific client |
| GET | `/api/all-clients-data` | Fetch data from all clients |
| GET | `/api/all-clients-metrics` | Fetch model metrics |
| GET | `/api/training/status` | Get training status |
| POST | `/api/training/start` | Start federated training |

### Client Server (Port 5001-5003)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Client health check |
| GET | `/api/local-data` | Get local data summary |
| GET | `/api/model-metrics` | Get model metrics |
| POST | `/api/train` | Trigger local training |
| GET | `/api/weights` | Get model weights |
| POST | `/api/weights` | Update model weights |

## Network Requirements

1. All devices must be on the **same network**
2. Firewall must allow ports 5000-5003
3. Use actual IP addresses (not localhost) for remote connections

### Finding Your IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

**Mac/Linux:**
```bash
ifconfig
# or
ip addr
```

## Registering Clients

From the Admin dashboard or via API:

```bash
curl -X POST http://localhost:5000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.1.100", "port": 5001, "id": "client_1"}'
```

## Troubleshooting

### "Connection refused" error
- Ensure the client server is running
- Check firewall settings
- Verify the IP address is correct

### "No data loaded" error
- Place `synthetic_dataset.csv` in the `data/` folder
- Or update `DATA_FILE` path in `server.py`

### Client shows as "offline"
- Check network connectivity
- Ping the client IP from admin laptop
- Verify ports are not blocked
