#!/bin/sh
set -e

echo "========================================"
echo "  Starting Client API Server"
echo "========================================"

# Client server doesn't need to run seed data
echo "Starting FastAPI client server..."
exec python client/server.py