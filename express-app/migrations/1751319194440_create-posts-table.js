/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export async function up(pgm) {
  pgm.createTable("posts", {
    id: "id",
    user_id: {
      type: "integer",
      notNull: true,
      references: "users(id)",
      onDelete: "cascade",
    },
    content: { type: "text", notNull: true },
    image_url: { type: "text", notNull: false },
    post_type: { type: "text", notNull: true }, // לדוגמה: 'freelancer', 'client', 'general'
    likes_count: { type: "integer", notNull: true, default: 0 },
    comments_count: { type: "integer", notNull: true, default: 0 },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("NOW()") },
    updated_at: { type: "timestamp", notNull: true, default: pgm.func("NOW()") },
    deleted_at: { type: "timestamp", default: null },
  });
}

export async function down(pgm) {
  pgm.dropTable("posts");
}
