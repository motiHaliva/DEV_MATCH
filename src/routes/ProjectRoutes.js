import express from 'express';
const router = express.Router();

import { getAllProjects, getProjectById,createProject,updateProject,deleteProject } from '../controllers/ProjectController.js';

router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;