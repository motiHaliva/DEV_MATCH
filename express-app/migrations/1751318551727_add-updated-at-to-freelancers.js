/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export async function up(pgm) {
  pgm.addColumn("freelancers", {
    updated_at: { type: "timestamp", notNull: false, default: null },
  });
}

export async function down(pgm) {
  pgm.dropColumn("freelancers", "updated_at");
}
