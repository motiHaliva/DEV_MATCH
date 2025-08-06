/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export async function up(pgm) {
  pgm.createTable("post_likes", {
    id: "id",
    user_id: {
      type: "integer",
      notNull: true,
      references: "users(id)",
      onDelete: "cascade",
    },
    post_id: {
      type: "integer",
      notNull: true,
      references: "posts(id)",
      onDelete: "cascade",
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("NOW()"),
    },
    deleted_at: {
      type: "timestamp",
      default: null,
    },
  });

  // מונע לייק כפול על אותו פוסט מאותו משתמש
  pgm.addConstraint("post_likes", "unique_user_post_like", {
    unique: ["user_id", "post_id"],
  });
}

export async function down(pgm) {
  pgm.dropTable("post_likes");
}
