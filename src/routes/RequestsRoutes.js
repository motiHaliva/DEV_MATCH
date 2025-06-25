import express from 'express';
const router = express.Router();

import{
    getRequestById,
    createRequest,
    deleteRequest,
    acceptRequest,
    rejectRequest,
    getRequestsByFreelancer,
    getRequestsByClient
} from '../controllers/RequestsController.js'


router.get('/:id', getRequestById);
router.post('/', createRequest);
router.delete('/:id', deleteRequest);
router.put('/accept/:id', acceptRequest);
router.put('/reject/:id', rejectRequest);
router.get('/freelancer/:freelancerId', getRequestsByFreelancer);
router.get('/client/:clientId', getRequestsByClient);

export default router;  