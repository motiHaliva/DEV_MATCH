/** @type {import('node-pg-migrate').Migration} */
export const up = (pgm) => {
  // טבלת דירוגים
  pgm.createTable('freelancer_ratings', {
    id: { type: 'serial', primaryKey: true },

    freelancer_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },

    client_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },

    rating: {
      type: 'integer',
      notNull: true,
      check: 'rating >= 1 AND rating <= 5',
    },

    comment: {
      type: 'text',
      notNull: false,
    },

    created_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
    },
  });

  // רק לקוח אחד יכול לדרג פרילנסר מסוים פעם אחת
  pgm.addConstraint('freelancer_ratings', 'unique_rating_per_pair', {
    unique: ['freelancer_id', 'client_id'],
  });

  // שדות בטבלת users – לשמור ממוצע דירוג וכמות דירוגים
  pgm.addColumns('users', {
    average_rating: {
      type: 'numeric(3,2)',
      default: 0,
      notNull: true,
    },
    rating_count: {
      type: 'integer',
      default: 0,
      notNull: true,
    },
  });
};

/** @type {import('node-pg-migrate').Migration} */
export const down = (pgm) => {
  pgm.dropConstraint('freelancer_ratings', 'unique_rating_per_pair');
  pgm.dropTable('freelancer_ratings');

  pgm.dropColumns('users', ['average_rating', 'rating_count']);
};
