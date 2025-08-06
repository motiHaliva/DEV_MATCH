/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.createTable('freelancers', {
    id: { type: 'serial', primaryKey: true },

    user_id: {
      type: 'integer',
      notNull: true,
      references: 'users(id)',
      onDelete: 'cascade'
    },

    is_available: {
      type: 'boolean',
      notNull: true,
      default: true
    },

    headline: {
      type: 'varchar(255)',
      notNull: true
    },

    bio: {
      type: 'text',
      notNull: false
    },

    experience_years: {
      type: 'integer',
      notNull: true,
      check: 'experience_years >= 0'
    },

    location: {
      type: 'varchar(100)',
      notNull: false
    }
  });
};

/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.dropTable('freelancers');
};
