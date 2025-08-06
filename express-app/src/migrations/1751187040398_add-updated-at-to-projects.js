/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  pgm.addColumn('projects', {
    updated_at: {
      type: 'timestamp',
      notNull: false,        // אפשר להגדיר אם צריך או לא
      default: pgm.func('CURRENT_TIMESTAMP'),  // או להגדיר ברירת מחדל
    },
  });
};

export const down = (pgm) => {
  pgm.dropColumn('projects', 'updated_at');
};
