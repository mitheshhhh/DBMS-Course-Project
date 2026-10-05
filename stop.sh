#!/bin/bash

echo "🛑 Stopping Smart Parking Management System..."
echo ""

# Stop Backend
if [ -f /tmp/parksmart-backend.pid ]; then
    BACKEND_PID=$(cat /tmp/parksmart-backend.pid)
    if ps -p $BACKEND_PID >/dev/null 2>&1; then
        echo "Stopping Backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
        sleep 1
    fi
    rm /tmp/parksmart-backend.pid
fi

# Kill any process on port 4000
if lsof -ti:4000 >/dev/null 2>&1; then
    echo "Stopping processes on port 4000..."
    lsof -ti:4000 | xargs kill -9 2>/dev/null
fi

echo "✅ Backend stopped"

# Stop Frontend
if [ -f /tmp/parksmart-frontend.pid ]; then
    FRONTEND_PID=$(cat /tmp/parksmart-frontend.pid)
    if ps -p $FRONTEND_PID >/dev/null 2>&1; then
        echo "Stopping Frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
        sleep 1
    fi
    rm /tmp/parksmart-frontend.pid
fi

# Kill any process on port 8080
if lsof -ti:8080 >/dev/null 2>&1; then
    echo "Stopping processes on port 8080..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null
fi

echo "✅ Frontend stopped"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Smart Parking System is STOPPED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
