import express from 'express';
import { authorizeRole,authorizeSelfOrAdmin } from '../middleware/Authorize.js';

import {
  getAllFreelancers,
  getFreelancerById,
  createFreelancer,
  updateFreelancer,
  deleteFreelancer
} from '../controllers/FreelancerController.js';

const router = express.Router();

router.get('/', getAllFreelancers);
router.get('/:id', getFreelancerById);


router.post('/', authorizeRole('client', 'admin'), createFreelancer);

router.put('/:id', authorizeRole('freelancer', 'admin'), updateFreelancer);

router.delete('/:id', authorizeRole('admin'), deleteFreelancer);

export default router;
