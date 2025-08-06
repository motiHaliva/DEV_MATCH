/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export async function up(pgm) {
  pgm.createTable("post_comments", {
    id: "id",
    post_id: {
      type: "integer",
      notNull: true,
      references: "posts(id)",
      onDelete: "cascade",
    },
    user_id: {
      type: "integer",
      notNull: true,
      references: "users(id)",
      onDelete: "cascade",
    },
    content: { type: "text", notNull: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("NOW()"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("NOW()"),
    },
    deleted_at: {
      type: "timestamp",
      default: null,
    },
    // אופציונלי: תגובה לתגובה
    // parent_comment_id: {
    //   type: "integer",
    //   references: "post_comments(id)",
    //   default: null,
    // },
  });
}

export async function down(pgm) {
  pgm.dropTable("post_comments");
}
