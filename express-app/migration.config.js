import dotenv from 'dotenv';
dotenv.config();

export default {
  databaseUrl: process.env.DATABASE_URL + '?sslmode=require',
  migrationsTable: 'pgmigrations',
  dir: 'src/migrations'
};