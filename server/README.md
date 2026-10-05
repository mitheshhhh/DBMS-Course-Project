# ParkSmart API (Express + MySQL)

1. `cd server && npm install`
2. `cp .env.example .env` and fill in your MySQL credentials.
3. If your column names differ, edit `queries.js` only (keep the `AS` aliases).
4. `npm start` — API runs on http://localhost:4000.
5. In the frontend, set `VITE_API_BASE_URL` to the API's public URL (defaults to http://localhost:4000).
