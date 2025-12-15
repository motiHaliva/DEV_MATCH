// import express from 'express';
// import { authorizeRole, authorizeSelfOrAdmin } from '../middleware/Authorize.js';
// import {
//   getAllProjects,
//   getProjectById,
//   createProject,
//   updateProject,
//   deleteProject,
//   getProjectsByUserId,
//   getMyProjects,
//   getClientProfile
// } from '../controllers/ProjectController.js';

// const router = express.Router();

// // ⚡ נתיבים ספציפיים ראשון - זה הסדר הנכון!
// router.get('/me', authorizeRole('client'), getMyProjects);
// router.get('/public/:client_id', getClientProfile);  // 👈 הוסר הסלאש בסוף
// router.get('/user/:id', getProjectsByUserId);
// router.get('/', getAllProjects);

// router.get('/:id', getProjectById);

// router.post('/', authorizeRole('client'), createProject);
// router.put('/:id', authorizeSelfOrAdmin, updateProject);
// router.delete('/:id', deleteProject);

// export default router;

import express from 'express';
import { authorizeRole, authorizeSelfOrAdmin } from '../middleware/Authorize.js';

import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
  
  // ✅ הוסף: 
  getMyClientProfile,
  updateMyClientProfile
} from '../controllers/ProjectController. js';

const router = express. Router();

// ✅ SPECIFIC ROUTES FIRST - Client Profile
router.get('/profile', authorizeRole('client', 'admin'), getMyClientProfile);
router.put('/profile', authorizeRole('client', 'admin'), updateMyClientProfile);

// Projects routes
router.get('/', getAllProjects);
router.post('/', authorizeRole('client', 'admin'), createProject);
router.get('/:id', getProjectById);
router.put('/:id', authorizeSelfOrAdmin, updateProject);
router.delete('/:id', authorizeSelfOrAdmin, deleteProject);

export default router;