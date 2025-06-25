/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  pgm.addColumn('projects', {
    client_id: {
      type: 'integer',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });
};

export const down = (pgm) => {
  pgm.dropColumn('projects', 'client_id');
};
