export const up = (pgm) => {
  pgm.createTable('freelancer_ratings', {
    id: 'id',
    freelancer_id: {
      type: 'integer',
      notNull: true,
      references: '"freelancers"',
      onDelete: 'CASCADE',
    },
    client_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
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
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.addConstraint('freelancer_ratings', 'unique_client_per_freelancer', {
    unique: ['freelancer_id', 'client_id'],
  });
};

export const down = (pgm) => {
  pgm.dropTable('freelancer_ratings');
};
