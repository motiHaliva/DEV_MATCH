// import express from 'express';
// import pool from './db.js';
// import userRoutes from './routes/UserRoutes.js';
// import freelancerRoutes from './routes/FreelancerRoutes.js';
// import projectRoutes from './routes/ProjectRoutes.js';
// import requestsRoutes from './routes/RequestsRoutes.js';
// import AuthRoutes from './routes/AuthRoutes.js';
// import AuthMiddleware from './middleware/AuthMiddleware.js';
// import SkillRoutes from './routes/SkillRoutes.js';
// import TitleRoutes from './routes/TitleRoutes.js';
// import cookieParser from 'cookie-parser';
// import PostRoutes from './routes/PostRoutes.js';
// import PostCommentRoutes from './routes/PostCommentRoutes.js';
// import PostLikeRoutes from './routes/PostLikeRoutes.js';
// import freelancerReviewsRoutes from './routes/freelancerReviewsRoutes.js';
// import cors from 'cors';
// import { exec } from 'child_process';
// import { promisify } from 'util';

// const execAsync = promisify(exec);

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(cors({
//   origin:  process.env.NODE_ENV === 'production'
//     ? ['https://dev-match-q2s2.vercel.app'] 
//     : ['http://localhost:5173'],
//   credentials: true,
// }));

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// app.use(cookieParser());
// app.use('/auth', AuthRoutes);
// app.use('/users', AuthMiddleware, userRoutes);
// app.use('/freelancers', AuthMiddleware, freelancerRoutes);
// app.use('/projects', AuthMiddleware, projectRoutes);
// app.use('/requests', AuthMiddleware, requestsRoutes);
// app.use('/skills', AuthMiddleware, SkillRoutes);
// app.use('/titles', AuthMiddleware, TitleRoutes);
// app.use('/posts', AuthMiddleware, PostRoutes);
// app.use('/post-comments', AuthMiddleware, PostCommentRoutes);
// app.use('/post-likes', AuthMiddleware, PostLikeRoutes);
// app.use('/freelancer-reviews', AuthMiddleware, freelancerReviewsRoutes);

// app.get('/health', async (req, res) => {
//   try {
//     const dbTest = await pool.query('SELECT NOW()');
//     const tablesCheck = await pool.query(`
//       SELECT table_name 
//       FROM information_schema.tables 
//       WHERE table_schema = 'public'
//       ORDER BY table_name
//     `);

//     res.json({
//       status: 'OK',
//       database: 'Connected',
//       timestamp: dbTest.rows[0].now,
//       tables: tablesCheck.rows.map(row => row.table_name),
//       tablesCount: tablesCheck.rows.length
//     });
//   } catch (error) {
//     res.json({
//       status: 'ERROR',
//       database: 'Disconnected',
//       error: error.message
//     });
//   }
// });

// app.get('/stats', async (req, res) => {
//   try {
//     const users = await pool.query('SELECT COUNT(*) FROM users');
//     const freelancers = await pool.query('SELECT COUNT(*) FROM freelancers');
//     const projects = await pool.query('SELECT COUNT(*) FROM projects');

//     res.json({
//       users: Number(users.rows[0].count),
//       freelancers: Number(freelancers.rows[0].count),
//       projects: Number(projects.rows[0].count)
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // להריץ מיגרציות ידנית
// app.post('/run-migrations', async (req, res) => {
//   try {
//     console.log('🔄 Manual migration requested...');
//     const result = await runMigrations();

//     res.json({
//       success: result,
//       message: result ? 'Migrations completed successfully' : 'Migrations failed'
//     });
//   } catch (error) {
//     res.json({
//       success: false,
//       message: 'Migration error',
//       error: error.message
//     });
//   }
// });

// // ===== פה התיקון =====
// async function runMigrations() {
//   try {
//     console.log('🔄 Starting database migrations...');
//     console.log('📂 Current directory:', process.cwd());
//     console.log('📂 Looking for migrations in: src/migrations');

//     const { stdout, stderr } = await execAsync(
//       'npx node-pg-migrate up --config migration.config.js',
//       {
//         env: {
//           ...process.env
//         }
//       }
//     );

//     if (stderr && !stderr.includes('No migrations to run')) {
//       console.error('Migration stderr:', stderr);
//     }

//     console.log('✅ Migrations completed successfully:');
//     console.log('stdout:', stdout);
//     return true;

//   } catch (error) {
//     console.error('❌ Migration failed:', error.message);
//     if (error.stdout) console.log('stdout:', error.stdout);
//     if (error.stderr) console.log('stderr:', error.stderr);
//     return false;
//   }
// }
// // ===== סוף התיקון =====

// async function checkMigrationsNeeded() {
//   try {
//     const result = await pool.query(`
//       SELECT EXISTS (
//         SELECT FROM information_schema.tables 
//         WHERE table_name = 'pgmigrations'
//       );
//     `);

//     if (!result.rows[0].exists) {
//       console.log('📋 Migrations table not found - running migrations...');
//       return true;
//     }

//     const migrationsResult = await pool.query('SELECT COUNT(*) FROM pgmigrations');
//     console.log(`📋 Found ${migrationsResult.rows[0].count} completed migrations`);

//     return true;
//   } catch (error) {
//     console.log('📋 Cannot check migrations status, will attempt to run:', error.message);
//     return true;
//   }
// }

// async function startServer() {
//   try {
//     const dbTestResult = await pool.query('SELECT NOW()');
//     console.log('✅ Connected to PostgreSQL! Time:', dbTestResult.rows[0].now);

//     const dbInfoResult = await pool.query('SELECT current_database(), current_user');
//     console.log('✅ Connected to DB:');
//     console.log('📦 Database:', dbInfoResult.rows[0].current_database);
//     console.log('👤 User:', dbInfoResult.rows[0].current_user);

//     const needsMigrations = await checkMigrationsNeeded();
//     if (needsMigrations) {
//       const migrationSuccess = await runMigrations();
//       if (!migrationSuccess) {
//         console.log('⚠️ Migrations failed - please check migration files and database configuration');
//       }
//     } else {
//       console.log('✅ All migrations are up to date');
//     }

//     app.listen(PORT, () => {
//       console.log(`🚀 Server is running on http://localhost:${PORT}`);
//     });

//   } catch (err) {
//     console.error('❌ Failed to connect to PostgreSQL:', err.message);
//     console.log('⚠️ Starting server without database connection...');

//     app.listen(PORT, () => {
//       console.log(`🚀 Server is running on http://localhost:${PORT} (DB connection failed)`);
//     });
//   }
// }

// startServer();

import express from 'express';
import pool from './db.js';
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

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS Configuration
app.use(cors({
  origin: [
    'https://dev-match-one.vercel.app',
    'https://dev-match-oqi4.vercel.app',
    'http://localhost:5173',
    'http://localhost:4000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit:  '10mb' }));
app.use(cookieParser());

// ✅ Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 DEV_MATCH API is running! ',
    version: '1.0.0',
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: 'GET /health - Database health check',
      stats: 'GET /stats - Platform statistics',
      auth: {
        signup: 'POST /auth/signup',
        login: 'POST /auth/login'
      },
      protected: {
        users: '/users/* (requires authentication)',
        freelancers:  '/freelancers/* (requires authentication)',
        projects: '/projects/* (requires authentication)',
        requests:  '/requests/* (requires authentication)',
        skills: '/skills/* (requires authentication)',
        titles: '/titles/* (requires authentication)',
        posts: '/posts/* (requires authentication)',
        postComments: '/post-comments/* (requires authentication)',
        postLikes: '/post-likes/* (requires authentication)',
        freelancerReviews: '/freelancer-reviews/* (requires authentication)'
      }
    }
  });
});

// ✅ Routes
app.use('/auth', AuthRoutes);
app.use('/users', AuthMiddleware, userRoutes);
app.use('/freelancers', AuthMiddleware, freelancerRoutes);
app.use('/projects', AuthMiddleware, projectRoutes);
app.use('/requests', AuthMiddleware, requestsRoutes);
app.use('/skills', AuthMiddleware, SkillRoutes);
app.use('/titles', AuthMiddleware, TitleRoutes);
app.use('/posts', AuthMiddleware, PostRoutes);
app.use('/post-comments', AuthMiddleware, PostCommentRoutes);
app.use('/post-likes', AuthMiddleware, PostLikeRoutes);
app.use('/freelancer-reviews', AuthMiddleware, freelancerReviewsRoutes);

// ✅ Health Check Endpoint
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
      tables: tablesCheck. rows.map(row => row. table_name),
      tablesCount: tablesCheck.rows. length,
      environment: process. env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      database: 'Disconnected',
      error: error.message
    });
  }
});

// ✅ Stats Endpoint
app.get('/stats', async (req, res) => {
  try {
    const users = await pool.query('SELECT COUNT(*) FROM users');
    const freelancers = await pool. query('SELECT COUNT(*) FROM freelancers');
    const projects = await pool.query('SELECT COUNT(*) FROM projects');

    res.json({
      users: Number(users.rows[0].count),
      freelancers: Number(freelancers.rows[0]. count),
      projects: Number(projects.rows[0].count),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ 
      error: err.message,
      hint: 'Ensure DATABASE_URL is configured in Vercel environment variables'
    });
  }
});

// ✅ Export for Vercel (Serverless Functions)
export default app;

// ✅ Local Development Server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, async () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    
    try {
      const dbTest = await pool.query('SELECT NOW()');
      console.log('✅ Connected to PostgreSQL!', dbTest.rows[0].now);
      
      const dbInfo = await pool.query('SELECT current_database(), current_user');
      console.log('📦 Database:', dbInfo.rows[0].current_database);
      console.log('👤 User:', dbInfo.rows[0].current_user);
    } catch (err) {
      console.error('❌ Failed to connect to PostgreSQL:', err.message);
    }
  });
}