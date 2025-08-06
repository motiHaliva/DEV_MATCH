/** @type {import('node-pg-migrate').Migration} */
export const up = (pgm) => {
  // טבלת skills
  pgm.createTable('skills', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true, unique: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    
  });

  // טבלת קישור בין users ל-skills
  pgm.createTable('user_skills', {
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },
    skill_id: {
      type: 'integer',
      notNull: true,
      references: '"skills"',
      onDelete: 'cascade',
    },
  });

  // מפתח ראשי משולב
  pgm.addConstraint('user_skills', 'pk_user_skills', {
    primaryKey: ['user_id', 'skill_id'],
  });
};

/** @type {import('node-pg-migrate').Migration} */
export const down = (pgm) => {
  pgm.dropTable('user_skills');
  pgm.dropTable('skills');
};
