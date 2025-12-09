#!/bin/bash
# Start both backend and frontend in tmux sessions

set -e

echo "🎙️  Starting Easy Voice Clone Application..."
echo ""

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    echo "❌ tmux is not installed. Please install it first:"
    echo "   macOS: brew install tmux"
    echo "   Ubuntu: sudo apt install tmux"
    exit 1
fi

# Detect if we're in app/ directory or root directory
if [ -d "backend" ] && [ -d "frontend" ]; then
    # We're in the app directory
    BACKEND_DIR="backend"
    FRONTEND_DIR="frontend"
elif [ -d "app/backend" ] && [ -d "app/frontend" ]; then
    # We're in the root directory
    BACKEND_DIR="app/backend"
    FRONTEND_DIR="app/frontend"
else
    echo "❌ Error: Cannot find backend and frontend directories"
    echo "Please run this from either:"
    echo "  - EasyVoiceClone/app/"
    echo "  - EasyVoiceClone/ (root)"
    exit 1
fi

# Kill existing session if it exists
tmux kill-session -t voice-clone 2>/dev/null || true

# Create new tmux session
tmux new-session -d -s voice-clone -n backend

# Start backend in first pane
tmux send-keys -t voice-clone:backend "cd $BACKEND_DIR && source venv/bin/activate && python server.py" C-m

# Create new window for frontend
tmux new-window -t voice-clone -n frontend
tmux send-keys -t voice-clone:frontend "cd $FRONTEND_DIR && npm start" C-m

# Attach to the session
echo ""
echo "✅ Application started in tmux session 'voice-clone'"
echo ""
echo "📝 Tmux commands:"
echo "  Ctrl+B then D - Detach from session"
echo "  tmux attach -t voice-clone - Reattach to session"
echo "  tmux kill-session -t voice-clone - Stop application"
echo ""
echo "Opening tmux session..."
sleep 2

tmux attach -t voice-clone
