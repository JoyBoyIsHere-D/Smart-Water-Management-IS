#!/bin/sh
set -e

echo "========================================"
echo "  Starting Smart Water Management API"
echo "========================================"

# Wait a moment for DB to be fully ready
sleep 2

# Run seed data script (idempotent - skips if data exists)
echo "Running seed data script..."
python seed_data.py || echo "Seed script completed (may have partial errors)"

echo ""
echo "Starting FastAPI server..."
exec python admin/server.py
