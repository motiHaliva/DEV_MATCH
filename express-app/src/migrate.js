// migrate.js
import dotenv from 'dotenv';
dotenv.config();

export default {
  databaseUrl: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, 
    },
  },
  migrationsTable: 'pgmigrations',
  dir: 'migrations',
};
