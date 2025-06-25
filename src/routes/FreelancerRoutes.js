import express from 'express';
const router = express.Router();
import { getAllFreelancers,
    getFreelancerById,
    createFreelancer,
    updateFreelancer,
    deleteFreelancer
 } from '../controllers/FreelancerController.js';

 // Get all freelancers
 router.get('/', getAllFreelancers);

 // Get freelancer by id
 router.get('/:id', getFreelancerById);

 // Create a new freelancer
 router.post('/', createFreelancer);

 // Update a freelancer
 router.put('/:id', updateFreelancer);

 // Delete a freelancer
 router.delete('/:id', deleteFreelancer);

 export default router;