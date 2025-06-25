import express from 'express';
import pool  from './db.js';
import userRoutes from './routes/UserRoutes.js';
import freelancerRoutes from './routes/FreelancerRoutes.js';
import projectRoutes from './routes/ProjectRoutes.js';
import requestsRoutes from './routes/RequestsRoutes.js';
import AuthRoutes from './routes/AuthRoutes.js';
import AuthMiddleware from './middleware/AuthMiddleware.js';





const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use('/auth', AuthRoutes);
app.use('/users',AuthMiddleware, userRoutes);
app.use('/freelancers',AuthMiddleware, freelancerRoutes);
app.use('/projects',AuthMiddleware, projectRoutes);
app.use('/requests',AuthMiddleware, requestsRoutes);






app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL! Time:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
  }
});



