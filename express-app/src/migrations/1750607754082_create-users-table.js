
/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.createTable('users', {
        id: { 
            type: 'serial',
             primaryKey: true 
            },
        firstname: {
             type: 'varchar(100)', 
             notNull: true },
        lastname:
         { type: 'varchar(100)',
             notNull: true },
        email: { type: 'varchar(255)',
             notNull: true,
              unique: true
             },
        role: {
            type: 'varchar(20)',
            notNull: true,
            check: "role IN ('admin', 'client', 'freelancer')",
        },
        password: { type: 'text', notNull: true },
        bio: { type: 'text', notNull: true },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('users');
};
