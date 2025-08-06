/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  pgm.alterColumn('users', 'bio', {
    notNull: false,
  });
};

export const down = (pgm) => {
  pgm.alterColumn('users', 'bio', {
    notNull: true,
  });
};
