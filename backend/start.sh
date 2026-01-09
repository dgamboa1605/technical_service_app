#!/bin/bash

# Script to start FastAPI server in production
# Usage: ./start.sh

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Copy env.example to .env and configure variables."
    exit 1
fi

# Verify JWT_SECRET_KEY is not the default value
if [ "$JWT_SECRET_KEY" = "123" ] || [ -z "$JWT_SECRET_KEY" ]; then
    echo "Error: JWT_SECRET_KEY must be configured in .env with a secure value (minimum 32 characters)"
    exit 1
fi

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Start server with uvicorn
echo "Starting FastAPI server in production mode..."
echo "Host: ${HOST:-127.0.0.1}"
echo "Port: ${PORT:-8000}"
echo "Workers: ${WORKERS:-4}"

exec uvicorn app.main:app \
    --host "${HOST:-127.0.0.1}" \
    --port "${PORT:-8000}" \
    --workers "${WORKERS:-4}" \
    --log-level info \
    --no-access-log \
    --proxy-headers \
    --forwarded-allow-ips "*"
