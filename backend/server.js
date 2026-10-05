import "dotenv/config";
import express from "express";
import cors from "cors";
import { testConnection } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";

// ── Import all route modules ────────────────────────────────────────────────
import customerRoutes from "./routes/customerRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import slotRoutes from "./routes/slotRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { Router } from "express";
import { asyncHandler } from "./middleware/errorHandler.js";
import { getStats, getActivity, searchCustomer } from "./controllers/dashboardController.js";

// ── Express app setup ───────────────────────────────────────────────────────
const app = express();
const PORT = Number(process.env.PORT || 4000);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:8080";

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(",").map((s) => s.trim()),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "ParkSmart API is running." });
});

// ── Dashboard routes ────────────────────────────────────────────────────────
const dashboardRouter = Router();
dashboardRouter.get("/stats", asyncHandler(getStats));
dashboardRouter.get("/activity", asyncHandler(getActivity));
dashboardRouter.get("/search/customer", asyncHandler(searchCustomer));

// ── Mount all routes ────────────────────────────────────────────────────────
app.use("/api", dashboardRouter);
app.use("/api/customers", customerRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/payments", paymentRoutes);

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found.`,
  });
});

// ── Centralized error handler ───────────────────────────────────────────────
app.use(errorHandler);

// ── Start server ────────────────────────────────────────────────────────────
async function startServer() {
  // Test database connection before starting
  await testConnection();

  app.listen(PORT, () => {
    console.log(`🚀 ParkSmart Backend running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/api/stats`);
    console.log(`🔗 CORS enabled for: ${CORS_ORIGIN}`);
  });
}

startServer();
