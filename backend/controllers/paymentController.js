import { pool } from "../config/db.js";
import { httpError } from "../middleware/errorHandler.js";

// DB uses: SUCCESS / PENDING / FAILED
// Frontend expects: PAID / PENDING / FAILED
// Map SUCCESS → PAID via SQL CASE expression.

const PAYMENT_SELECT = `
  SELECT payment_id AS paymentId, bill_id AS billId, amount_paid AS amountPaid,
         CASE UPPER(status) WHEN 'SUCCESS' THEN 'PAID' ELSE UPPER(status) END AS paymentStatus,
         payment_time AS paymentTime
    FROM payment`;

// ── GET /api/payments ───────────────────────────────────────────────────────
export async function getPayments(req, res) {
  const [rows] = await pool.query(`${PAYMENT_SELECT} ORDER BY payment_id DESC`);
  res.json(rows);
}

// ── GET /api/payments/:id ───────────────────────────────────────────────────
export async function getPaymentById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw httpError(400, "Invalid payment ID.");

  const [[payment]] = await pool.query(
    `${PAYMENT_SELECT} WHERE payment_id = ?`,
    [id]
  );
  if (!payment) throw httpError(404, "Payment not found.");
  res.json(payment);
}
