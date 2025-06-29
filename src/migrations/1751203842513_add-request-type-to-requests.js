/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  // יצירת ENUM חדש
  pgm.createType('request_type_enum', ['client_to_freelancer', 'freelancer_to_client']);

  // הוספת העמודה לטבלת requests
  pgm.addColumn('requests', {
    request_type: {
      type: 'request_type_enum',
      notNull: true,
      default: 'client_to_freelancer', // ברירת מחדל זמנית כדי שהמיגרציה תעבור גם על נתונים קיימים
    },
  });
};

export const down = (pgm) => {
  pgm.dropColumn('requests', 'request_type');
  pgm.dropType('request_type_enum');
};
