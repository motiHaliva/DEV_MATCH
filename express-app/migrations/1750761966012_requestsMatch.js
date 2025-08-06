/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  // קודם נגדיר ENUM לסטטוס, אם לא קיים עדיין
  pgm.createType('request_status_enum', ['pending', 'matched', 'declined']);

  pgm.createTable('requests', {
    id: 'id', // מזהה ראשי אוטומטי serial primary key

    from_user_id: {
      type: 'integer',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },

    to_user_id: {
      type: 'integer',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },

    project_id: {
      type: 'integer',
      references: 'projects(id)',
      onDelete: 'SET NULL',
      notNull: false,
    },

    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },

    status: {
      type: 'request_status_enum',
      notNull: true,
      default: 'pending',
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable('requests');
  pgm.dropType('request_status_enum');
};
