#!/bin/bash
# Setup and run Easy Voice Clone Application

set -e

echo "=========================================="
echo "🎙️  Easy Voice Clone - Application Setup"
echo "=========================================="
echo ""

# Detect if we're in app/ directory or root directory
if [ -d "backend" ] && [ -d "frontend" ]; then
    # We're in the app directory
    APP_DIR="."
elif [ -d "app/backend" ] && [ -d "app/frontend" ]; then
    # We're in the root directory
    APP_DIR="app"
else
    echo "❌ Error: Cannot find backend and frontend directories"
    echo "Please run this from either:"
    echo "  - EasyVoiceClone/app/"
    echo "  - EasyVoiceClone/ (root)"
    exit 1
fi

# Backend Setup
echo "📦 Setting up backend...."
cd "$APP_DIR/backend"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate and install dependencies
source venv/bin/activate
echo "Installing backend dependencies..."
pip install --upgrade pip > /dev/null
pip install -r requirements.txt

# Go back to app directory
cd ..

# Frontend Setup
echo ""
echo "📦 Setting up frontend..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies (this may take a minute)..."
    npm install
fi

# Return to original directory
cd ..

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "🚀 To start the application:"
echo ""
echo "Terminal 1 (Backend):"
if [ "$APP_DIR" = "." ]; then
    echo "  cd backend"
else
    echo "  cd app/backend"
fi
echo "  source venv/bin/activate"
echo "  python server.py"
echo ""
echo "Terminal 2 (Frontend):"
if [ "$APP_DIR" = "." ]; then
    echo "  cd frontend"
else
    echo "  cd app/frontend"
fi
echo "  npm start"
echo ""
echo "Then open http://localhost:3000 in your browser!"
echo ""
