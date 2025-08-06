// migration.config.js
import dotenv from 'dotenv';
dotenv.config();

export default {
  direction: 'up',
  databaseUrl: process.env.DATABASE_URL,
  migrationsTable: 'pgmigrations',
  dir: 'migrations',
};
