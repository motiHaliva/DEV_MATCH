import express from 'express';
const router = express.Router();
import { getAllFreelancers,
    getFreelancerById,
    createFreelancer,
    updateFreelancer,
    deleteFreelancer
 } from '../controllers/FreelancerController.js';


 router.get('/', getAllFreelancers);
 router.get('/:id', getFreelancerById);
 router.post('/', createFreelancer);
 router.put('/:id', updateFreelancer);
 router.delete('/:id', deleteFreelancer);

 export default router;