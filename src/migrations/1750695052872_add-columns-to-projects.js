/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */

export const up = (pgm) => {
  // יצירת enum חדש לסוג הפרויקט
  pgm.createType('project_type_enum', ['website', 'app', 'ecommerce']);

  // הוספת שדות לטבלה
  pgm.addColumns('projects', {
    created_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    project_type: {
      type: 'project_type_enum',
      notNull: true,
    },
  });
};

export const down = (pgm) => {
  pgm.dropColumns('projects', ['created_at', 'project_type']);
  pgm.dropType('project_type_enum');
};
