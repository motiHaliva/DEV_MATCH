/** @type {import('node-pg-migrate').Migration} */
export const up = (pgm) => {
  pgm.createTable('titles', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true, unique: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('user_titles', {
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },
    title_id: {
      type: 'integer',
      notNull: true,
      references: 'titles',
      onDelete: 'cascade',
    },
  });

  pgm.addConstraint('user_titles', 'pk_user_titles', {
    primaryKey: ['user_id', 'title_id'],
  });
};

export const down = (pgm) => {
  pgm.dropTable('user_titles');
  pgm.dropTable('titles');
};
