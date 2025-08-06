// migration.config.js
import dotenv from 'dotenv';

dotenv.config();

export default {
  direction: 'up',
  databaseUrl: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
  migrationsTable: 'pgmigrations',
  dir: 'migrations', 
};
