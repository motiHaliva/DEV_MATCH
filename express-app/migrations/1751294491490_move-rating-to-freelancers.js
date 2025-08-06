// src/migrations/YYYYMMDDHHMMSS_move-rating-to-freelancers.js

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export async function up(pgm) {
  pgm.dropColumns("users", ["average_rating", "rating_count"]);

  pgm.addColumns("freelancers", {
    rating: { type: "float", default: 0 },
    rating_count: { type: "integer", default: 0 },
  });
}

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export async function down(pgm) {
  pgm.addColumns("users", {
    rating: { type: "float", default: 0 },
    rating_count: { type: "integer", default: 0 },
  });

  pgm.dropColumns("freelancers", ["rating", "rating_count"]);
}
