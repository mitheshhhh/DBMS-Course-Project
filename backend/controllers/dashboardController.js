import { pool } from "../config/db.js";

// ── GET /api/stats ──────────────────────────────────────────────────────────
// Frontend type: { totalSlots, occupied, available, activeSessions, totalRevenue }
// DB payment status uses SUCCESS (not PAID) — filter on SUCCESS for revenue.
export async function getStats(req, res) {
  const [[stats]] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM parking_slot) AS totalSlots,
      (SELECT COUNT(*) FROM parking_slot WHERE status = 'OCCUPIED') AS occupied,
      (SELECT COUNT(*) FROM parking_slot WHERE status = 'FREE') AS available,
      (SELECT COUNT(*) FROM parking_session WHERE status = 'ACTIVE') AS activeSessions,
      (SELECT COALESCE(SUM(amount_paid), 0) FROM payment WHERE status = 'SUCCESS') AS totalRevenue
  `);
  res.json(stats);
}

// ── GET /api/activity ───────────────────────────────────────────────────────
// Frontend type: { id, kind: "entry"|"exit"|"payment", title, meta, time }
export async function getActivity(req, res) {
  const [rows] = await pool.query(`
    (SELECT CONCAT('in-', s.session_id) AS id, 'entry' AS kind,
            CONCAT(v.license_plate, ' entered') AS title,
            CONCAT('Slot ', ps.slot_number) AS meta,
            s.entry_time AS time
       FROM parking_session s
       JOIN vehicle v ON v.vehicle_id = s.vehicle_id
       JOIN parking_slot ps ON ps.slot_id = s.slot_id)
    UNION ALL
    (SELECT CONCAT('out-', s.session_id), 'exit',
            CONCAT(v.license_plate, ' exited'),
            CONCAT('Slot ', ps.slot_number),
            s.exit_time
       FROM parking_session s
       JOIN vehicle v ON v.vehicle_id = s.vehicle_id
       JOIN parking_slot ps ON ps.slot_id = s.slot_id
      WHERE s.exit_time IS NOT NULL)
    UNION ALL
    (SELECT CONCAT('pay-', p.payment_id), 'payment',
            CONCAT('Payment of ', p.amount_paid),
            CASE UPPER(p.status) WHEN 'SUCCESS' THEN 'PAID' ELSE UPPER(p.status) END,
            p.payment_time
       FROM payment p
      WHERE p.payment_time IS NOT NULL)
    ORDER BY time DESC LIMIT 15
  `);
  res.json(rows);
}

// ── GET /api/search/customer ────────────────────────────────────────────────
// Frontend type: { name, licensePlate, parkingStatus, entryTime, exitTime, amountPaid, paymentStatus }
export async function searchCustomer(req, res) {
  const name = req.query.name || "";
  const [rows] = await pool.query(`
    SELECT c.name, v.license_plate AS licensePlate,
           UPPER(s.status) AS parkingStatus,
           s.entry_time AS entryTime, s.exit_time AS exitTime,
           p.amount_paid AS amountPaid,
           CASE UPPER(p.status) WHEN 'SUCCESS' THEN 'PAID' ELSE UPPER(p.status) END AS paymentStatus
      FROM customer c
      JOIN vehicle v ON v.customer_id = c.customer_id
      JOIN parking_session s ON s.vehicle_id = v.vehicle_id
      LEFT JOIN bill b ON b.session_id = s.session_id
      LEFT JOIN payment p ON p.bill_id = b.bill_id
     WHERE c.name LIKE ?
     ORDER BY s.entry_time DESC
     LIMIT 50
  `, [`%${name}%`]);
  res.json(rows);
}
