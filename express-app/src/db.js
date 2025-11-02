import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
    // ssl: {
    //   rejectUnauthorized: false,
    // },
});

(async () => {
  try {
    const result = await pool.query('SELECT current_database(), current_user');
    console.log("✅ Connected to DB:");
    console.log("📦 Database:", result.rows[0].current_database);
    console.log("👤 User:", result.rows[0].current_user);
  } catch (err) {
    console.error("❌ Failed to connect to DB:", err.message);
    process.exit(1); // סגור את השרת אם אין חיבור למסד
  }
})();

export default pool;
