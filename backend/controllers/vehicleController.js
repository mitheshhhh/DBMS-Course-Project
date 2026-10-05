import { pool } from "../config/db.js";
import { httpError } from "../middleware/errorHandler.js";

const BASE_SELECT = `
  SELECT v.vehicle_id AS vehicleId, v.customer_id AS customerId,
         c.name AS customerName, v.license_plate AS licensePlate,
         UPPER(v.vehicle_type) AS vehicleType
    FROM vehicle v
    JOIN customer c ON c.customer_id = v.customer_id`;

// ── GET /api/vehicles ───────────────────────────────────────────────────────
export async function getVehicles(req, res) {
  const search = req.query.search ? `%${req.query.search}%` : null;

  const sql = search
    ? `${BASE_SELECT} WHERE v.license_plate LIKE ? OR c.name LIKE ? ORDER BY v.vehicle_id`
    : `${BASE_SELECT} ORDER BY v.vehicle_id`;

  const params = search ? [search, search] : [];
  const [rows] = await pool.query(sql, params);
  res.json(rows);
}

// ── GET /api/vehicles/:id ───────────────────────────────────────────────────
export async function getVehicleById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw httpError(400, "Invalid vehicle ID.");

  const [[vehicle]] = await pool.query(
    `${BASE_SELECT} WHERE v.vehicle_id = ?`,
    [id]
  );
  if (!vehicle) throw httpError(404, "Vehicle not found.");
  res.json(vehicle);
}

// ── POST /api/vehicles ──────────────────────────────────────────────────────
export async function createVehicle(req, res) {
  const { customerId, licensePlate, vehicleType } = req.body;
  if (!customerId || !licensePlate || !vehicleType)
    throw httpError(400, "customerId, licensePlate and vehicleType are required.");

  const validTypes = ["CAR", "BIKE"];
  if (!validTypes.includes(vehicleType.toUpperCase()))
    throw httpError(400, `vehicleType must be one of: ${validTypes.join(", ")}.`);

  const [result] = await pool.query(
    `INSERT INTO vehicle (customer_id, license_plate, vehicle_type) VALUES (?, ?, ?)`,
    [customerId, licensePlate.trim().toUpperCase(), vehicleType.toUpperCase()]
  );
  res.status(201).json({
    success: true,
    data: { vehicleId: result.insertId, customerId, licensePlate, vehicleType },
  });
}

// ── PUT /api/vehicles/:id ───────────────────────────────────────────────────
export async function updateVehicle(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw httpError(400, "Invalid vehicle ID.");

  const { licensePlate, vehicleType, customerId } = req.body;
  if (!licensePlate && !vehicleType && !customerId)
    throw httpError(400, "Provide at least one field to update.");

  const fields = [];
  const params = [];
  if (licensePlate) { fields.push("license_plate = ?"); params.push(licensePlate.trim().toUpperCase()); }
  if (vehicleType) {
    const validTypes = ["CAR", "BIKE"];
    if (!validTypes.includes(vehicleType.toUpperCase()))
      throw httpError(400, `vehicleType must be one of: ${validTypes.join(", ")}.`);
    fields.push("vehicle_type = ?");
    params.push(vehicleType.toUpperCase());
  }
  if (customerId) { fields.push("customer_id = ?"); params.push(customerId); }
  params.push(id);

  const [result] = await pool.query(
    `UPDATE vehicle SET ${fields.join(", ")} WHERE vehicle_id = ?`,
    params
  );
  if (result.affectedRows === 0) throw httpError(404, "Vehicle not found.");
  res.json({ success: true, message: "Vehicle updated." });
}

// ── DELETE /api/vehicles/:id ────────────────────────────────────────────────
export async function deleteVehicle(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw httpError(400, "Invalid vehicle ID.");

  const [result] = await pool.query(
    `DELETE FROM vehicle WHERE vehicle_id = ?`,
    [id]
  );
  if (result.affectedRows === 0) throw httpError(404, "Vehicle not found.");
  res.json({ success: true, message: "Vehicle deleted." });
}
