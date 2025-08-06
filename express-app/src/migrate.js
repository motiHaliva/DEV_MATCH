// migrate.js
require('dotenv').config();

module.exports = {
  databaseUrl: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  },
  migrationsTable: 'pgmigrations',
  dir: 'src/migrations', 
};
