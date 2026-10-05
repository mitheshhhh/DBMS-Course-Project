import { pool } from "../config/db.js";
import { httpError } from "../middleware/errorHandler.js";

// ── GET /api/customers ──────────────────────────────────────────────────────
// The DB column is `phone` but the frontend expects `contact` → alias it.
export async function getCustomers(req, res) {
  const search = req.query.search ? `%${req.query.search}%` : null;

  const sql = search
    ? `SELECT customer_id AS customerId, name, phone AS contact, email
         FROM customer
        WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?
        ORDER BY customer_id`
    : `SELECT customer_id AS customerId, name, phone AS contact, email
         FROM customer
        ORDER BY customer_id`;

  const params = search ? [search, search, search] : [];
  const [rows] = await pool.query(sql, params);
  res.json(rows);
}

// ── GET /api/customers/:id ──────────────────────────────────────────────────
export async function getCustomerById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw httpError(400, "Invalid customer ID.");

  const [[customer]] = await pool.query(
    `SELECT customer_id AS customerId, name, phone AS contact, email
       FROM customer WHERE customer_id = ?`,
    [id]
  );
  if (!customer) throw httpError(404, "Customer not found.");

  const [vehicles] = await pool.query(
    `SELECT v.vehicle_id AS vehicleId, v.customer_id AS customerId,
            c.name AS customerName, v.license_plate AS licensePlate,
            UPPER(v.vehicle_type) AS vehicleType
       FROM vehicle v
       JOIN customer c ON c.customer_id = v.customer_id
      WHERE v.customer_id = ?`,
    [id]
  );

  const [sessions] = await pool.query(
    `SELECT s.session_id AS sessionId, s.vehicle_id AS vehicleId,
            v.license_plate AS licensePlate, ps.slot_number AS slotNumber,
            s.entry_time AS entryTime, s.exit_time AS exitTime,
            UPPER(s.status) AS status
       FROM parking_session s
       JOIN vehicle v ON v.vehicle_id = s.vehicle_id
       JOIN parking_slot ps ON ps.slot_id = s.slot_id
      WHERE v.customer_id = ?
      ORDER BY s.entry_time DESC`,
    [id]
  );

  res.json({ ...customer, vehicles, sessions });
}

// ── POST /api/customers ─────────────────────────────────────────────────────
export async function createCustomer(req, res) {
  const { name, contact, email } = req.body;
  if (!name || !contact || !email)
    throw httpError(400, "name, contact and email are required.");

  const [result] = await pool.query(
    `INSERT INTO customer (name, phone, email) VALUES (?, ?, ?)`,
    [name.trim(), contact.trim(), email.trim()]
  );
  res.status(201).json({
    success: true,
    data: { customerId: result.insertId, name, contact, email },
  });
}

// ── PUT /api/customers/:id ──────────────────────────────────────────────────
export async function updateCustomer(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw httpError(400, "Invalid customer ID.");

  const { name, contact, email } = req.body;
  if (!name && !contact && !email)
    throw httpError(400, "Provide at least one field to update.");

  const fields = [];
  const params = [];
  if (name) { fields.push("name = ?"); params.push(name.trim()); }
  if (contact) { fields.push("phone = ?"); params.push(contact.trim()); }
  if (email) { fields.push("email = ?"); params.push(email.trim()); }
  params.push(id);

  const [result] = await pool.query(
    `UPDATE customer SET ${fields.join(", ")} WHERE customer_id = ?`,
    params
  );
  if (result.affectedRows === 0) throw httpError(404, "Customer not found.");
  res.json({ success: true, message: "Customer updated." });
}

// ── DELETE /api/customers/:id ───────────────────────────────────────────────
export async function deleteCustomer(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw httpError(400, "Invalid customer ID.");

  const [result] = await pool.query(
    `DELETE FROM customer WHERE customer_id = ?`,
    [id]
  );
  if (result.affectedRows === 0) throw httpError(404, "Customer not found.");
  res.json({ success: true, message: "Customer deleted." });
}
