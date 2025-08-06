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
import cors from 'cors'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173',
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

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL! Time:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
  }
});



