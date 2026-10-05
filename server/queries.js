// All SQL lives here. Adjust table/column names to match your schema;
// the frontend only depends on the aliased output names.

export const Q = {
  stats: `
    SELECT
      (SELECT COUNT(*) FROM PARKING_SLOT) AS totalSlots,
      (SELECT COUNT(*) FROM PARKING_SLOT WHERE status = 'OCCUPIED') AS occupied,
      (SELECT COUNT(*) FROM PARKING_SLOT WHERE status = 'FREE') AS available,
      (SELECT COUNT(*) FROM PARKING_SESSION WHERE status = 'ACTIVE') AS activeSessions,
      (SELECT COALESCE(SUM(amount_paid), 0) FROM PAYMENT WHERE payment_status = 'PAID') AS totalRevenue`,

  slots: `
    SELECT slot_id AS slotId, slot_number AS slotNumber, UPPER(slot_type) AS vehicleType, UPPER(status) AS status
    FROM PARKING_SLOT ORDER BY slot_number`,

  customers: `
    SELECT customer_id AS customerId, name, contact, email FROM CUSTOMER ORDER BY customer_id`,

  customer: `
    SELECT customer_id AS customerId, name, contact, email FROM CUSTOMER WHERE customer_id = ?`,

  vehicles: `
    SELECT v.vehicle_id AS vehicleId, v.customer_id AS customerId, c.name AS customerName,
           v.license_plate AS licensePlate, UPPER(v.vehicle_type) AS vehicleType
    FROM VEHICLE v JOIN CUSTOMER c ON c.customer_id = v.customer_id`,

  sessions: `
    SELECT s.session_id AS sessionId, s.vehicle_id AS vehicleId, v.license_plate AS licensePlate,
           ps.slot_number AS slotNumber, s.entry_time AS entryTime, s.exit_time AS exitTime, UPPER(s.status) AS status
    FROM PARKING_SESSION s
    JOIN VEHICLE v ON v.vehicle_id = s.vehicle_id
    JOIN PARKING_SLOT ps ON ps.slot_id = s.slot_id`,

  bills: `
    SELECT b.bill_id AS billId, b.session_id AS sessionId, b.amount, b.bill_time AS billTime,
           v.license_plate AS licensePlate, ps.slot_number AS slotNumber
    FROM BILL b
    LEFT JOIN PARKING_SESSION s ON s.session_id = b.session_id
    LEFT JOIN VEHICLE v ON v.vehicle_id = s.vehicle_id
    LEFT JOIN PARKING_SLOT ps ON ps.slot_id = s.slot_id
    ORDER BY b.bill_id DESC`,

  payments: `
    SELECT payment_id AS paymentId, bill_id AS billId, amount_paid AS amountPaid,
           UPPER(payment_status) AS paymentStatus, payment_time AS paymentTime
    FROM PAYMENT ORDER BY payment_id DESC`,

  activity: `
    (SELECT CONCAT('in-', s.session_id) AS id, 'entry' AS kind, CONCAT(v.license_plate, ' entered') AS title,
            CONCAT('Slot ', ps.slot_number) AS meta, s.entry_time AS time
       FROM PARKING_SESSION s JOIN VEHICLE v ON v.vehicle_id = s.vehicle_id JOIN PARKING_SLOT ps ON ps.slot_id = s.slot_id)
    UNION ALL
    (SELECT CONCAT('out-', s.session_id), 'exit', CONCAT(v.license_plate, ' exited'), CONCAT('Slot ', ps.slot_number), s.exit_time
       FROM PARKING_SESSION s JOIN VEHICLE v ON v.vehicle_id = s.vehicle_id JOIN PARKING_SLOT ps ON ps.slot_id = s.slot_id
      WHERE s.exit_time IS NOT NULL)
    UNION ALL
    (SELECT CONCAT('pay-', p.payment_id), 'payment', CONCAT('Payment of ', p.amount_paid), p.payment_status, p.payment_time
       FROM PAYMENT p WHERE p.payment_time IS NOT NULL)
    ORDER BY time DESC LIMIT 15`,

  customerSearch: `
    SELECT c.name, v.license_plate AS licensePlate, UPPER(s.status) AS parkingStatus,
           s.entry_time AS entryTime, s.exit_time AS exitTime,
           p.amount_paid AS amountPaid, UPPER(p.payment_status) AS paymentStatus
    FROM CUSTOMER c
    JOIN VEHICLE v ON v.customer_id = c.customer_id
    JOIN PARKING_SESSION s ON s.vehicle_id = v.vehicle_id
    LEFT JOIN BILL b ON b.session_id = s.session_id
    LEFT JOIN PAYMENT p ON p.bill_id = b.bill_id
    WHERE c.name LIKE ?
    ORDER BY s.entry_time DESC LIMIT 50`,
};
