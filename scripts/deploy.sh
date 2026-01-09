#!/bin/bash

# Automated deployment script
# Usage: ./scripts/deploy.sh [backend|frontend|all]

set -e

DEPLOY_DIR="/var/www/technical_service_app"
BACKEND_DIR="$DEPLOY_DIR/backend"
FRONTEND_DIR="$DEPLOY_DIR/frontend"

print_info() {
    echo "[INFO] $1"
}

print_warn() {
    echo "[WARN] $1"
}

print_error() {
    echo "[ERROR] $1"
}

deploy_backend() {
    print_info "Deploying backend..."
    
    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "Directory $BACKEND_DIR does not exist"
        exit 1
    fi
    
    cd "$BACKEND_DIR"
    
    # Activate virtual environment
    if [ ! -d "venv" ]; then
        print_info "Creating virtual environment..."
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    
    # Install/update dependencies
    print_info "Installing dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Check .env
    if [ ! -f ".env" ]; then
        print_warn ".env not found. Copying env.example..."
        if [ -f "env.example" ]; then
            cp env.example .env
            print_warn "Please configure the .env file before continuing"
            exit 1
        else
            print_error "env.example not found"
            exit 1
        fi
    fi
    
    # Run migrations
    print_info "Running migrations..."
    alembic upgrade head
    
    # Restart service
    if systemctl is-active --quiet technical-service-api; then
        print_info "Restarting backend service..."
        sudo systemctl restart technical-service-api
    else
        print_warn "Backend service is not active. Starting manually..."
        print_info "To start: sudo systemctl start technical-service-api"
    fi
    
    print_info "Backend deployed successfully"
}

deploy_frontend() {
    print_info "Deploying frontend..."
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        print_error "Directory $FRONTEND_DIR does not exist"
        exit 1
    fi
    
    cd "$FRONTEND_DIR"
    
    # Install dependencies
    print_info "Installing dependencies..."
    npm install
    
    # Configure .env if it doesn't exist
    if [ ! -f ".env" ]; then
        if [ -f "env.production.example" ]; then
            print_info "Copying env.production.example to .env..."
            cp env.production.example .env
        else
            print_warn "env.production.example not found. Using default values"
        fi
    fi
    
    # Build application
    print_info "Building application..."
    npm run build
    
    # Verify build was created
    if [ ! -d "dist" ]; then
        print_error "Build was not created successfully"
        exit 1
    fi
    
    # Adjust permissions
    print_info "Adjusting permissions..."
    sudo chown -R www-data:www-data dist/
    
    # Reload nginx
    print_info "Reloading nginx..."
    sudo systemctl reload nginx
    
    print_info "Frontend deployed successfully"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ] && ! sudo -n true 2>/dev/null; then
    print_error "This script requires sudo privileges"
    exit 1
fi

# Process arguments
case "${1:-all}" in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all)
        deploy_backend
        deploy_frontend
        ;;
    *)
        print_error "Usage: $0 [backend|frontend|all]"
        exit 1
        ;;
esac

print_info "Deployment completed"
