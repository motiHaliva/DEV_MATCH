import express from 'express';
import { authorizeRole, authorizeSelfOrAdmin } from '../middleware/Authorize.js';

import {
  getAllFreelancers,
  createFreelancer,
  updateFreelancer,
  deleteFreelancer,
  getPublicFreelancerProfile,
  getMyFreelancerProfile,
  updateMyFreelancerProfile
} from '../controllers/FreelancerController.js';

const router = express.Router();

router.get('/me', getMyFreelancerProfile);

router.put('/me', updateMyFreelancerProfile);

router.get('/', getAllFreelancers);

router.get('/public/:id', getPublicFreelancerProfile);

router.post('/', authorizeRole('freelancer', 'admin'), createFreelancer);

router.put('/:id', authorizeSelfOrAdmin, updateFreelancer);

router.delete('/:id', authorizeRole('admin'), deleteFreelancer);

export default router;