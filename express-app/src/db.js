import dotenv from 'dotenv';
import pg from 'pg';

dotenv. config();

const { Pool } = pg;

// קביעת SSL בהתאם לסביבה
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env. POSTGRES_URL,
  ssl:  isProduction 
    ? { rejectUnauthorized: false }  // ✅ SSL בפרודקשן (Vercel)
    : false  // ❌ ללא SSL בפיתוח מקומי (localhost)
});

// בדיקת חיבור - רק ב-development (לא ב-serverless)
if (! isProduction) {
  (async () => {
    try {
      const result = await pool. query(`
        SELECT current_database(), current_user;
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public';
      `);
      
      console.log("✅ Connected to DB:");
      console.log("📦 Database:", result[0].rows[0].current_database);
      console.log("👤 User:", result[0].rows[0].current_user);
      console.log("📋 Tables:", result[1].rows.map(row => row.table_name));
      
    } catch (err) {
      console.error("❌ Failed to connect to DB:", err.message);
      // לא עושים process.exit(1) כי זה יכבה את הסרוור
    }
  })();
}

export default pool;