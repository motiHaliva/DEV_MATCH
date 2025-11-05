require('dotenv').config();

// module.exports = {
//   databaseUrl: process.env.DATABASE_URL + '?sslmode=require',
// //   databaseUrl: process.env.DATABASE_URL,
//   migrationsTable: 'pgmigrations',
//   dir: 'migrations'
// };

module.exports = {
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  dir: "migrations"
};
