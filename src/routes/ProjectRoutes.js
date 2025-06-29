import express from 'express';
import { authorizeRole, authorizeSelfOrAdmin } from '../middleware/Authorize.js';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectsByUserId,
  getMyProjects
} from '../controllers/ProjectController.js';

const router = express.Router();



router.get('/me', authorizeRole('client'), getMyProjects);

router.get('/user/:id', getProjectsByUserId); 

router.get('/', getAllProjects); 

router.get('/:id', getProjectById); 

router.post('/', authorizeRole('client'), createProject);

router.put('/:id', authorizeSelfOrAdmin, updateProject);

router.delete('/:id', authorizeSelfOrAdmin, deleteProject);

export default router;