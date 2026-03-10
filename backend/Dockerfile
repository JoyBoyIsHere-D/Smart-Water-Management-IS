# Backend Dockerfile
# Uses python:3.11-slim as base — TensorFlow will be installed via pip
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required by TensorFlow, asyncpg, and others
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the entire backend
COPY . .

# Expose both server ports
EXPOSE 5000 5001

# Default: run the admin server
# Override in docker-compose for the client server
CMD ["python", "admin/server.py"]
