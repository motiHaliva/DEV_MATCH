/** @type {import('node-pg-migrate').Migration} */
export const up = (pgm) => {
  // הוספת עמודת deleted_at לטבלת skills
  pgm.addColumn('skills', {
    deleted_at: {
      type: 'timestamp',
      default: null,
    },
  });

  // הוספת עמודת deleted_at לטבלת titles
  pgm.addColumn('titles', {
    deleted_at: {
      type: 'timestamp',
      default: null,
    },
  });
};

export const down = (pgm) => {
  // מחיקת העמודות אם נרצה לחזור אחורה
  pgm.dropColumn('skills', 'deleted_at');
  pgm.dropColumn('titles', 'deleted_at');
};