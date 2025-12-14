import pool from './db.js';

// ✅ כל ה-migrations שלך לפי הסדר הכרונולוגי המדויק
const migrations = [
  // 1. יצירת טבלת users
  {
    name: '1750607754082_create-users-table',
    sql:  `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        firstname VARCHAR(100) NOT NULL,
        lastname VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'client', 'freelancer')),
        password TEXT NOT NULL,
        bio TEXT NOT NULL
      );
    `
  },

  // 2. יצירת טבלת freelancers
  {
    name:  '1750608625629_create-freelancers-table',
    sql: `
      CREATE TABLE IF NOT EXISTS freelancers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_available BOOLEAN NOT NULL DEFAULT true,
        headline VARCHAR(255) NOT NULL,
        bio TEXT,
        experience_years INTEGER NOT NULL CHECK (experience_years >= 0),
        location VARCHAR(100)
      );
    `
  },

  // 3. יצירת טבלת projects
  {
    name: '1750680629728_create-project-table',
    sql: `
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        deadline DATE,
        is_open BOOLEAN NOT NULL DEFAULT true
      );
    `
  },

  // 4. הוספת timestamps ל-users
  {
    name: '1750687624340_add-timestamps-to-users',
    sql: `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
    `
  },

  // 5. הוספת created_at ל-freelancers
  {
    name: '1750688131251_add-created-at-to-freelancers',
    sql: `
      ALTER TABLE freelancers
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
    `
  },

  // 6. הוספת עמודות ל-projects
  {
    name: '1750695052872_add-columns-to-projects',
    sql: `
      DO $$ BEGIN
        CREATE TYPE project_type_enum AS ENUM ('website', 'app', 'ecommerce');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS project_type project_type_enum;
    `
  },

  // 7. שינוי role ל-enum
  {
    name: '1750695218044_change-role-to-enum',
    sql: `
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('admin', 'client', 'freelancer');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;
      EXCEPTION
        WHEN OTHERS THEN null;
      END $$;
    `
  },

  // 8. הוספת client_id ל-projects
  {
    name: '1750760125271_add-client-id-to-projects',
    sql: `
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    `
  },

  // 9. יצירת טבלת requests
  {
    name: '1750761966012_requestsMatch',
    sql: `
      DO $$ BEGIN
        CREATE TYPE request_status_enum AS ENUM ('pending', 'matched', 'declined');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        from_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        to_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        status request_status_enum NOT NULL DEFAULT 'pending'
      );
    `
  },

  // 10. הוספת deleted_at ל-users
  {
    name: '1750839881996_add-deleted-at-to-users',
    sql: `
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;
    `
  },

  // 11. הוספת deleted_at ל-freelancers
  {
    name: '1750839882930_add-deleted-at-to-freelancers',
    sql: `
      ALTER TABLE freelancers
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;
    `
  },

  // 12. הוספת deleted_at ל-projects
  {
    name:  '1750839883961_add-deleted-at-to-projects',
    sql: `
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;
    `
  },

  // 13. הוספת deleted_at ל-requests
  {
    name: '1750844416106_add-deleted-at-to-requests',
    sql: `
      ALTER TABLE requests
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;
    `
  },

  // 14. הוספת updated_at ל-projects
  {
    name: '1751187040398_add-updated-at-to-projects',
    sql: `
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `
  },

  // 15. הוספת request_type ל-requests
  {
    name: '1751203842513_add-request-type-to-requests',
    sql: `
      DO $$ BEGIN
        CREATE TYPE request_type_enum AS ENUM ('client_to_freelancer', 'freelancer_to_client');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      ALTER TABLE requests
      ADD COLUMN IF NOT EXISTS request_type request_type_enum DEFAULT 'client_to_freelancer';
    `
  },

  // 16. יצירת טבלאות skills ו-user_skills
  {
    name: '1751268992905_create-skills-and-user-skills',
    sql: `
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_skills (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, skill_id)
      );
    `
  },

  // 17. יצירת טבלאות titles ו-user_titles
  {
    name: '1751279577357_create-titles-and-user-titles',
    sql: `
      CREATE TABLE IF NOT EXISTS titles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_titles (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title_id INTEGER NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, title_id)
      );
    `
  },

  // 18. יצירת טבלת freelancer_ratings
  {
    name: '1751289654210_add-freelancer-ratings-table',
    sql: `
      CREATE TABLE IF NOT EXISTS freelancer_ratings (
        id SERIAL PRIMARY KEY,
        freelancer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (freelancer_id, client_id)
      );

      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
    `
  },

  // 19. העברת rating ל-freelancers
  {
    name: '1751294491490_move-rating-to-freelancers',
    sql: `
      ALTER TABLE users
      DROP COLUMN IF EXISTS average_rating,
      DROP COLUMN IF EXISTS rating_count;

      ALTER TABLE freelancers
      ADD COLUMN IF NOT EXISTS rating FLOAT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
    `
  },

  // 20. הוספת profile_image ל-users
  {
    name: '1751317404455_add-profile-image-to-users',
    sql: `
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS profile_image TEXT DEFAULT NULL;
    `
  },

  // 21. הוספת updated_at ל-freelancers
  {
    name: '1751318551727_add-updated-at-to-freelancers',
    sql: `
      ALTER TABLE freelancers
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NULL;
    `
  },

  // 22. יצירת טבלת posts
  {
    name: '1751319194440_create-posts-table',
    sql: `
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        image_url TEXT,
        post_type TEXT NOT NULL,
        likes_count INTEGER NOT NULL DEFAULT 0,
        comments_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP DEFAULT NULL
      );
    `
  },

  // 23. יצירת טבלת post_comments
  {
    name: '1751390769043_create-post-comments-table',
    sql: `
      CREATE TABLE IF NOT EXISTS post_comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP DEFAULT NULL
      );
    `
  },

  // 24. יצירת טבלת post_likes
  {
    name: '1751394598439_create-post-likes-table',
    sql: `
      CREATE TABLE IF NOT EXISTS post_likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP DEFAULT NULL,
        UNIQUE (user_id, post_id)
      );
    `
  },

  // 25. שינוי bio ל-nullable ב-users
  {
    name: '1752753076499_make-bio-column-nullable',
    sql: `
      ALTER TABLE users
      ALTER COLUMN bio DROP NOT NULL;
    `
  },

  // 26. הוספת deleted_at ל-skills ו-titles
  {
    name: '1754520678383_add-deleted-at-to-skills-and-titles',
    sql:  `
      ALTER TABLE skills
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

      ALTER TABLE titles
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;
    `
  },

  // 27. הוספת phone ל-users
  {
    name: '1762417363428_add-phone-to-users',
    sql: `
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '';
    `
  }
];

// ✅ פונקציה להרצת migrations
export async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting migrations...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations_log (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    const { rows: executedMigrations } = await client.query(
      'SELECT name FROM migrations_log'
    );
    const executedNames = executedMigrations.map(m => m.name);
    
    let successCount = 0;
    let skippedCount = 0;
    
    for (const migration of migrations) {
      if (! executedNames.includes(migration. name)) {
        console.log(`  ⚙️ Running:  ${migration.name}`);
        
        try {
          await client.query(migration.sql);
          await client.query(
            'INSERT INTO migrations_log (name) VALUES ($1)',
            [migration.name]
          );
          
          console.log(`  ✅ Completed: ${migration.name}`);
          successCount++;
        } catch (error) {
          console. error(`  ❌ Failed: ${migration.name}`);
          console.error(`     Error: ${error.message}`);
        }
      } else {
        skippedCount++;
      }
    }
    
    console. log(`\n✅ Migrations completed! `);
    console.log(`   - Executed: ${successCount}`);
    console.log(`   - Skipped: ${skippedCount}`);
    console.log(`   - Total: ${migrations.length}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Migration system failed:', error. message);
    return false;
  } finally {
    client. release();
  }
}

export async function checkAndRunMigrations() {
  try {
    const { rows } = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      ) as users_exists;
    `);
    
    if (!rows[0].users_exists) {
      console.log('📋 Users table not found - running migrations...');
      return await runMigrations();
    }
    
    console.log('✅ Database tables exist');
    return true;
    
  } catch (error) {
    console.error('Error checking migrations:', error. message);
    return await runMigrations();
  }
}