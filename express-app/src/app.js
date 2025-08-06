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
import pgMigrate from 'node-pg-migrate';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// פונקציה להריץ מיגרציות
async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...');
    
    const migrationsResult = await pgMigrate({
      databaseUrl: process.env.DATABASE_URL,
      migrationsTable: 'pgmigrations',
      dir: join(__dirname, '../migrations'),
      direction: 'up',
      verbose: true,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log('✅ Migrations completed successfully:', migrationsResult);
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('⚠️ Continuing without migrations...');
    return false;
  }
}

// התחלת השרת עם מיגרציות
async function startServer() {
  try {
    // 1. בדוק חיבור לDB ורוץ מיגרציות
    const dbTestResult = await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL! Time:', dbTestResult.rows[0].now);
    
    // 2. הרץ מיגרציות
    await runMigrations();
    
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