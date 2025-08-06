/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export async function up(pgm) {
  pgm.addColumn("users", {
    profile_image: { type: "text", notNull: false, default: null },
  });
}

export async function down(pgm) {
  pgm.dropColumn("users", "profile_image");
}
