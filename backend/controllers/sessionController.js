import { pool } from "../config/db.js";
import { httpError } from "../middleware/errorHandler.js";

const SESSION_SELECT = `
  SELECT s.session_id AS sessionId, s.vehicle_id AS vehicleId,
         v.license_plate AS licensePlate, ps.slot_number AS slotNumber,
         s.entry_time AS entryTime, s.exit_time AS exitTime,
         UPPER(s.status) AS status
    FROM parking_session s
    JOIN vehicle v ON v.vehicle_id = s.vehicle_id
    JOIN parking_slot ps ON ps.slot_id = s.slot_id`;

// ── GET /api/sessions ───────────────────────────────────────────────────────
export async function getSessions(req, res) {
  const [rows] = await pool.query(`${SESSION_SELECT} ORDER BY s.entry_time DESC`);
  res.json(rows);
}

// ── GET /api/sessions/:id ───────────────────────────────────────────────────
export async function getSessionById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw httpError(400, "Invalid session ID.");

  const [[session]] = await pool.query(
    `${SESSION_SELECT} WHERE s.session_id = ?`,
    [id]
  );
  if (!session) throw httpError(404, "Parking session not found.");
  res.json(session);
}

// ── POST /api/sessions — start a new parking session ───────────────────────
// Business rules:
//   1. Verify vehicle exists.
//   2. Verify slot exists and is FREE.
//   3. Create session with status ACTIVE.
//   4. Mark slot OCCUPIED.
//   All within a MySQL transaction.
export async function createSession(req, res) {
  const { vehicleId, slotId } = req.body;
  if (!vehicleId || !slotId)
    throw httpError(400, "vehicleId and slotId are required.");

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Verify vehicle
    const [[vehicle]] = await conn.query(
      `SELECT vehicle_id FROM vehicle WHERE vehicle_id = ?`,
      [vehicleId]
    );
    if (!vehicle) throw httpError(404, "Vehicle not found.");

    // 2. Verify slot is FREE
    const [[slot]] = await conn.query(
      `SELECT slot_id, status FROM parking_slot WHERE slot_id = ? FOR UPDATE`,
      [slotId]
    );
    if (!slot) throw httpError(404, "Parking slot not found.");
    if (slot.status.toUpperCase() !== "FREE")
      throw httpError(409, "Parking slot is already occupied.");

    // 3. Create session
    const [sessionResult] = await conn.query(
      `INSERT INTO parking_session (vehicle_id, slot_id, entry_time, status)
       VALUES (?, ?, NOW(), 'ACTIVE')`,
      [vehicleId, slotId]
    );

    // 4. Mark slot OCCUPIED
    await conn.query(
      `UPDATE parking_slot SET status = 'OCCUPIED' WHERE slot_id = ?`,
      [slotId]
    );

    await conn.commit();
    res.status(201).json({
      success: true,
      data: { sessionId: sessionResult.insertId, vehicleId, slotId, status: "ACTIVE" },
    });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// ── PUT /api/sessions/:id — complete a session (vehicle exit) ───────────────
// Business rules:
//   1. Verify session exists and is ACTIVE.
//   2. Set exit_time = NOW() and status = COMPLETED.
//   3. Mark slot FREE.
//   All within a MySQL transaction.
export async function updateSession(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw httpError(400, "Invalid session ID.");

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Verify session is ACTIVE
    const [[session]] = await conn.query(
      `SELECT session_id, slot_id, status FROM parking_session WHERE session_id = ? FOR UPDATE`,
      [id]
    );
    if (!session) throw httpError(404, "Parking session not found.");
    if (session.status.toUpperCase() !== "ACTIVE")
      throw httpError(409, "Session is already completed.");

    // 2. Complete session
    await conn.query(
      `UPDATE parking_session SET exit_time = NOW(), status = 'COMPLETED' WHERE session_id = ?`,
      [id]
    );

    // 3. Free the slot
    await conn.query(
      `UPDATE parking_slot SET status = 'FREE' WHERE slot_id = ?`,
      [session.slot_id]
    );

    await conn.commit();
    res.json({ success: true, message: "Session completed. Slot is now free." });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
