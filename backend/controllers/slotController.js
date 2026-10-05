import { pool } from "../config/db.js";
import { httpError } from "../middleware/errorHandler.js";

// ── GET /api/slots ──────────────────────────────────────────────────────────
export async function getSlots(req, res) {
  const [rows] = await pool.query(
    `SELECT slot_id AS slotId, slot_number AS slotNumber,
            UPPER(slot_type) AS vehicleType, UPPER(status) AS status
       FROM parking_slot
      ORDER BY slot_number`
  );
  res.json(rows);
}

// ── GET /api/slots/:id ──────────────────────────────────────────────────────
export async function getSlotById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw httpError(400, "Invalid slot ID.");

  const [[slot]] = await pool.query(
    `SELECT slot_id AS slotId, slot_number AS slotNumber,
            UPPER(slot_type) AS vehicleType, UPPER(status) AS status
       FROM parking_slot WHERE slot_id = ?`,
    [id]
  );
  if (!slot) throw httpError(404, "Parking slot not found.");
  res.json(slot);
}
