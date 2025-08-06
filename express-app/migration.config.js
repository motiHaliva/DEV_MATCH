require('dotenv').config();
const path = require('path');

module.exports = {
  databaseUrl: process.env.DATABASE_URL + '?sslmode=require',
  migrationsTable: 'pgmigrations',
  dir: path.join(__dirname, 'src', 'migrations'),
};
