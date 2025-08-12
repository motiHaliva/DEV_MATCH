import express from 'express';
import pool  from './db.js';
import userRoutes from './routes/UserRoutes.js';
import freelancerRoutes from './routes/FreelancerRoutes.js';
import projectRoutes from './routes/ProjectRoutes.js';
import requestsRoutes from './routes/RequestsRoutes.js';
import AuthRoutes from './routes/AuthRoutes.js';
import AuthMiddleware from './middleware/AuthMiddleware.js'; 
import SkillRoutes from './routes/SkillRoutes.js';
import TitleRoutes from './routes/TitleRoutes.js';
import cookieParser from 'cookie-parser';
import PostRoutes from './routes/PostRoutes.js';
import PostCommentRoutes from './routes/PostCommentRoutes.js';
import PostLikeRoutes from './routes/PostLikeRoutes.js';
import freelancerReviewsRoutes from './routes/freelancerReviewsRoutes.js';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:5173', 'https://dev-match-one.vercel.app'],
  credentials: true, 
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cookieParser());
app.use('/auth', AuthRoutes);
app.use('/users',AuthMiddleware, userRoutes);
app.use('/freelancers',AuthMiddleware, freelancerRoutes);
app.use('/projects',AuthMiddleware, projectRoutes);
app.use('/requests',AuthMiddleware, requestsRoutes);
app.use('/skills', AuthMiddleware, SkillRoutes);
app.use('/titles', AuthMiddleware, TitleRoutes);
app.use('/posts',AuthMiddleware, PostRoutes );
app.use('/post-comments',AuthMiddleware, PostCommentRoutes);
app.use('/post-likes',AuthMiddleware, PostLikeRoutes);
app.use('/freelancer-reviews', AuthMiddleware, freelancerReviewsRoutes);

// Routes לבדיקת מצב ומיגרציות
app.get('/health', async (req, res) => {
  try {
    const dbTest = await pool.query('SELECT NOW()');
    const tablesCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    res.json({
      status: 'OK',
      database: 'Connected',
      timestamp: dbTest.rows[0].now,
      tables: tablesCheck.rows.map(row => row.table_name),
      tablesCount: tablesCheck.rows.length
    });
  } catch (error) {
    res.json({
      status: 'ERROR',
      database: 'Disconnected',
      error: error.message
    });
  }
});

// Route להרצת מיגרציות ידנית
app.post('/run-migrations', async (req, res) => {
  try {
    console.log('🔄 Manual migration requested...');
    const result = await runMigrations();
    
    res.json({
      success: result,
      message: result ? 'Migrations completed successfully' : 'Migrations failed'
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Migration error',
      error: error.message
    });
  }
});

// פונקציה להריץ מיגרציות עם SSL נכון
async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...');
    console.log('📂 Current directory:', process.cwd());
    console.log('📂 Looking for migrations in: src/migrations');
    
    const { stdout, stderr } = await execAsync('npx node-pg-migrate up --config migration.config.js', {
      env: {
        ...process.env,
        PGSSLMODE: 'require'
      }
    });
    
    if (stderr && !stderr.includes('No migrations to run')) {
      console.error('Migration stderr:', stderr);
    }
    
    console.log('✅ Migrations completed successfully:');
    console.log('stdout:', stdout);
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.stdout) console.log('stdout:', error.stdout);
    if (error.stderr) console.log('stderr:', error.stderr);
    return false;
  }
}

// פונקציה לבדוק אם צריך להריץ מיגרציות
async function checkMigrationsNeeded() {
  try {
    // בדוק אם קיימת טבלת migrations
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pgmigrations'
      );
    `);
    
    if (!result.rows[0].exists) {
      console.log('📋 Migrations table not found - running migrations...');
      return true;
    }
    
    // בדוק אם יש מיגרציות חדשות
    const migrationsResult = await pool.query('SELECT COUNT(*) FROM pgmigrations');
    console.log(`📋 Found ${migrationsResult.rows[0].count} completed migrations`);
    
    // תמיד נריץ מיגרציות - node-pg-migrate יבדוק בעצמו אם יש חדשות
    return true;
    
  } catch (error) {
    console.log('📋 Cannot check migrations status, will attempt to run:', error.message);
    return true;
  }
}

// התחלת השרת עם מיגרציות
async function startServer() {
  try {

    const dbTestResult = await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL! Time:', dbTestResult.rows[0].now);
    
    const dbInfoResult = await pool.query('SELECT current_database(), current_user');
    console.log('✅ Connected to DB:');
    console.log('📦 Database:', dbInfoResult.rows[0].current_database);
    console.log('👤 User:', dbInfoResult.rows[0].current_user);
    
    // 2. בדוק אם צריך מיגרציות והרץ אותן
    const needsMigrations = await checkMigrationsNeeded();
    if (needsMigrations) {
      const migrationSuccess = await runMigrations();
      if (!migrationSuccess) {
        console.log('⚠️ Migrations failed - please check migration files and database configuration');
        console.log('🔍 Check: https://dev-match-h981.onrender.com/health for database status');
      }
    } else {
      console.log('✅ All migrations are up to date');
    }
    
    // 3. התחל את השרת
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
    
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
    console.log('⚠️ Starting server without database connection...');
    
    // התחל את השרת גם אם יש בעיה עם DB
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT} (DB connection failed)`);
    });
  }
}

// התחל את השרת
startServer();