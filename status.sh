#!/bin/bash

echo "📊 Smart Parking System Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check MySQL
echo -n "MySQL:    "
if mysql -u root -pMithu-2007 -e "USE smart_parking_db" &>/dev/null; then
    echo "✅ Running (smart_parking_db)"
else
    echo "❌ Not running or database not found"
fi

# Check Backend
echo -n "Backend:  "
if curl -s http://localhost:4000/api/health >/dev/null 2>&1; then
    echo "✅ Running (http://localhost:4000)"
else
    echo "❌ Not running"
fi

# Check Frontend
echo -n "Frontend: "
if curl -s http://localhost:8080 >/dev/null 2>&1; then
    echo "✅ Running (http://localhost:8080)"
else
    echo "❌ Not running"
fi

echo ""

# Show stats if backend is running
if curl -s http://localhost:4000/api/health >/dev/null 2>&1; then
    echo "📈 Current Statistics:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    curl -s http://localhost:4000/api/stats | python3 -m json.tool 2>/dev/null || echo "Stats unavailable"
fi
