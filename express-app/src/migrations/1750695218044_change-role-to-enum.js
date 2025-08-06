export const up = (pgm) => {
  // צור טיפוס enum חדש
  pgm.createType('user_role', ['admin', 'client', 'freelancer']);

  // שנה את העמודה role לשימוש ב־enum
  pgm.alterColumn('users', 'role', {
    type: 'user_role',
    using: "role::user_role"
  });
};

export const down = (pgm) => {
  // החזר את העמודה לטקסט עם check
  pgm.alterColumn('users', 'role', {
    type: 'varchar(20)',
    using: "role::varchar",
  });

  pgm.sql("ALTER TABLE users ADD CONSTRAINT role_check CHECK (role IN ('admin', 'client', 'freelancer'))");

  pgm.dropType('user_role');
};
