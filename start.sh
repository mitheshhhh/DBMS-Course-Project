#!/bin/bash

# Load MySQL password from backend/.env if available
if [ -f /Users/mithu/Downloads/pkg/backend/.env ]; then
    export $(grep "^DB_PASSWORD=" /Users/mithu/Downloads/pkg/backend/.env | xargs)
fi

echo "🚀 Starting Smart Parking Management System..."
echo ""

# Check MySQL
echo "📊 Checking MySQL..."
if ! mysql -u root -p"${DB_PASSWORD}" -e "SELECT 1" &>/dev/null; then
    echo "❌ MySQL is not running. Starting MySQL..."
    brew services start mysql 2>/dev/null || {
        echo "⚠️  Could not start MySQL automatically."
        echo "Please start MySQL manually and run this script again."
        exit 1
    }
    sleep 3
fi

# Verify database exists
if ! mysql -u root -p"${DB_PASSWORD}" -e "USE smart_parking_db" &>/dev/null; then
    echo "❌ Database 'smart_parking_db' not found!"
    exit 1
fi

echo "✅ MySQL connected to smart_parking_db"
echo ""

# Start Backend
echo "🔧 Starting Backend (Port 4000)..."
cd /Users/mithu/Downloads/pkg/backend
if lsof -ti:4000 >/dev/null 2>&1; then
    echo "⚠️  Port 4000 already in use. Stopping existing process..."
    lsof -ti:4000 | xargs kill -9 2>/dev/null
    sleep 1
fi

npm start > /tmp/parksmart-backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "Waiting for backend to initialize..."
for i in {1..10}; do
    if curl -s http://localhost:4000/api/health >/dev/null 2>&1; then
        echo "✅ Backend running on http://localhost:4000"
        break
    fi
    sleep 1
done

if ! curl -s http://localhost:4000/api/health >/dev/null 2>&1; then
    echo "❌ Backend failed to start. Check logs: /tmp/parksmart-backend.log"
    exit 1
fi
echo ""

# Start Frontend
echo "🎨 Starting Frontend (Port 8080)..."
cd /Users/mithu/Downloads/pkg

if lsof -ti:8080 >/dev/null 2>&1; then
    echo "⚠️  Port 8080 already in use. Stopping existing process..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null
    sleep 1
fi

npm run dev > /tmp/parksmart-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
echo "Waiting for frontend to initialize..."
for i in {1..15}; do
    if curl -s http://localhost:8080 >/dev/null 2>&1; then
        echo "✅ Frontend running on http://localhost:8080"
        break
    fi
    sleep 1
done

if ! curl -s http://localhost:8080 >/dev/null 2>&1; then
    echo "❌ Frontend failed to start. Check logs: /tmp/parksmart-frontend.log"
    exit 1
fi
echo ""

# Get current stats
echo "📈 System Status:"
curl -s http://localhost:4000/api/stats | python3 -m json.tool 2>/dev/null || echo "Stats unavailable"
echo ""

# Save PIDs
echo "$BACKEND_PID" > /tmp/parksmart-backend.pid
echo "$FRONTEND_PID" > /tmp/parksmart-frontend.pid

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Smart Parking System is RUNNING!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Frontend:  http://localhost:8080"
echo "🔌 Backend:   http://localhost:4000"
echo "📊 Database:  smart_parking_db (MySQL)"
echo ""
echo "📝 Logs:"
echo "   Backend:  /tmp/parksmart-backend.log"
echo "   Frontend: /tmp/parksmart-frontend.log"
echo ""
echo "🛑 To stop: ./stop.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
