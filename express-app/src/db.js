import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  // ✅ Vercel מוסיף את STORAGE_URL אוטומטית
  connectionString: process.env.STORAGE_URL || process.env. POSTGRES_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized:  false
  },
  max:  3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis:  10000
});

if (! process.env. STORAGE_URL && !process.env.DATABASE_URL) {
  console.error('❌ No database URL found!');
} else {
  console.log('✅ Database configured');
}

pool.on('error', (err) => {
  console.error('Database error:', err);
});

export default pool;