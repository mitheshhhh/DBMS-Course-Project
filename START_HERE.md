# Smart Parking System - Quick Commands

## Start the System

```bash
cd /Users/mithu/Downloads/pkg
./start.sh
```

This will:
- ✅ Check MySQL connection (password: Mithu-2007)
- ✅ Start Backend on http://localhost:4000
- ✅ Start Frontend on http://localhost:8080
- ✅ Verify everything is working

## Stop the System

```bash
cd /Users/mithu/Downloads/pkg
./stop.sh
```

This will safely stop both frontend and backend.

## Check Status

```bash
cd /Users/mithu/Downloads/pkg
./status.sh
```

This shows:
- MySQL status
- Backend status
- Frontend status
- Current parking statistics

## Access the Application

Once started:
- **Open in browser**: http://localhost:8080
- **API endpoint**: http://localhost:4000

## System Requirements

- MySQL running with database: `smart_parking_db`
- MySQL password: `Mithu-2007`
- Ports 4000 and 8080 available

## Features Available

- ✅ View customers, vehicles, parking slots, sessions, bills, payments
- ✅ Add new customers and vehicles
- ✅ Start parking sessions
- ✅ Complete parking sessions
- ✅ Edit/delete records
- ✅ Real-time dashboard statistics
- ✅ Search and filter

## Troubleshooting

If something doesn't start:

1. **MySQL not running?**
   ```bash
   brew services start mysql
   ```

2. **Ports in use?**
   ```bash
   ./stop.sh
   ./start.sh
   ```

3. **Check logs:**
   - Backend: `/tmp/parksmart-backend.log`
   - Frontend: `/tmp/parksmart-frontend.log`

---

**That's it!** Just run `./start.sh` and you're ready to go.
