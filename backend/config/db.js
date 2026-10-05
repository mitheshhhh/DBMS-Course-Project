import "dotenv/config";
import mysql from "mysql2/promise";

// Connection pool — shared across all controllers
export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "smart_parking_db",
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  // Return JS numbers for DECIMAL columns (e.g., amount, amount_paid)
  decimalNumbers: true,
});

/**
 * Verify the database connection on startup.
 * Logs success or a descriptive error without crashing.
 */
export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    const [[{ db }]] = await conn.query("SELECT DATABASE() AS db");
    conn.release();
    console.log(`✅ Connected to MySQL database: ${db}`);
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
    console.error(
      "   Make sure MySQL is running and the credentials in .env are correct."
    );
    process.exit(1);
  }
}
