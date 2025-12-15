// import pkg from 'pg';
// const { Pool } = pkg;

// const pool = new Pool({
//   // ✅ Vercel מוסיף את STORAGE_URL אוטומטית
//   connectionString: process.env.STORAGE_URL || process.env. POSTGRES_URL || process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized:  false
//   },
//   max:  3,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis:  10000
// });

// if (! process.env. STORAGE_URL && !process.env.DATABASE_URL) {
//   console.error('❌ No database URL found!');
// } else {
//   console.log('✅ Database configured');
// }

// pool.on('error', (err) => {
//   console.error('Database error:', err);
// });

// export default pool;

import pkg from 'pg';
const { Pool } = pkg;

const isProduction = process.env.NODE_ENV === 'production';

const connectionString =
  process.env.STORAGE_URL ||
  process.env.POSTGRES_URL ||   // ✅ בלי רווח
  process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false, // ✅ רק בפרודקשן
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

console.log('✅ Database configured:', {
  isProduction,
  hasConnectionString: !!connectionString,
});

pool.on('error', (err) => {
  console.error('Database error:', err);
});

export default pool;
