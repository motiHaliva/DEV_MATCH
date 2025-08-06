import dotenv from 'dotenv';
dotenv.config();

export default {
  databaseUrl: process.env.DATABASE_URL,
  ssl: true, 
  migrationsTable: 'pgmigrations',
  dir: 'migrations',
};