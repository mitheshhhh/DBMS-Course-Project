import { pool } from "../config/db.js";
import { httpError } from "../middleware/errorHandler.js";

// ── GET /api/bills ──────────────────────────────────────────────────────────
export async function getBills(req, res) {
  const [rows] = await pool.query(
    `SELECT b.bill_id AS billId, b.session_id AS sessionId,
            b.amount, b.bill_time AS billTime,
            v.license_plate AS licensePlate, ps.slot_number AS slotNumber
       FROM bill b
       LEFT JOIN parking_session s ON s.session_id = b.session_id
       LEFT JOIN vehicle v ON v.vehicle_id = s.vehicle_id
       LEFT JOIN parking_slot ps ON ps.slot_id = s.slot_id
      ORDER BY b.bill_id DESC`
  );
  res.json(rows);
}

// ── GET /api/bills/:id ──────────────────────────────────────────────────────
export async function getBillById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw httpError(400, "Invalid bill ID.");

  const [[bill]] = await pool.query(
    `SELECT b.bill_id AS billId, b.session_id AS sessionId,
            b.amount, b.bill_time AS billTime,
            v.license_plate AS licensePlate, ps.slot_number AS slotNumber
       FROM bill b
       LEFT JOIN parking_session s ON s.session_id = b.session_id
       LEFT JOIN vehicle v ON v.vehicle_id = s.vehicle_id
       LEFT JOIN parking_slot ps ON ps.slot_id = s.slot_id
      WHERE b.bill_id = ?`,
    [id]
  );
  if (!bill) throw httpError(404, "Bill not found.");
  res.json(bill);
}
