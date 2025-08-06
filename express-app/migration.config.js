import dotenv from 'dotenv';
dotenv.config();


const databaseUrl = process.env.DATABASE_URL;

export default {
  databaseUrl: databaseUrl,
  migrationsTable: 'pgmigrations',
  dir: 'migrations',
  ssl: true,
  'ssl-mode': 'require'
};