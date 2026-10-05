import "dotenv/config";
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import { Q } from "./queries.js";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  decimalNumbers: true,
});

const app = express();
const origin = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: origin === "*" ? true : origin.split(",").map((s) => s.trim()) }));

const route = (fn) => async (req, res) => {
  try { res.json(await fn(req)); }
  catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
};
const rows = async (sql, params = []) => (await pool.query(sql, params))[0];

app.get("/api/health", route(async () => ({ ok: true })));
app.get("/api/stats", route(async () => (await rows(Q.stats))[0]));
app.get("/api/slots", route(() => rows(Q.slots)));
app.get("/api/customers", route(() => rows(Q.customers)));
app.get("/api/customers/:id", route(async (req) => {
  const id = Number(req.params.id);
  const [c] = await rows(Q.customer, [id]);
  if (!c) throw new Error("Customer not found");
  const vehicles = await rows(`${Q.vehicles} WHERE v.customer_id = ?`, [id]);
  const sessions = await rows(`${Q.sessions} WHERE v.customer_id = ? ORDER BY s.entry_time DESC`, [id]);
  return { ...c, vehicles, sessions };
}));
app.get("/api/vehicles", route(() => rows(`${Q.vehicles} ORDER BY v.vehicle_id`)));
app.get("/api/sessions", route(() => rows(`${Q.sessions} ORDER BY s.entry_time DESC`)));
app.get("/api/bills", route(() => rows(Q.bills)));
app.get("/api/payments", route(() => rows(Q.payments)));
app.get("/api/activity", route(() => rows(Q.activity)));
app.get("/api/search/customer", route((req) => rows(Q.customerSearch, [`%${req.query.name ?? ""}%`])));

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`ParkSmart API on http://localhost:${port}`));
