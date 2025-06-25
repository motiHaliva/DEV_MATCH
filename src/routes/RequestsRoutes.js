import express from 'express';
import { authorizeRole, authorizeSelfOrAdmin } from '../middleware/Authorize.js';

import {
    getRequestById,
    createRequest,
    deleteRequest,
    acceptRequest,
    rejectRequest,
    getRequestsByFreelancer,
    getRequestsByClient
} from '../controllers/RequestsController.js';

const router = express.Router();

router.get('/:id', authorizeSelfOrAdmin, getRequestById);
router.post('/', authorizeRole('client'), createRequest);
router.delete('/:id', authorizeSelfOrAdmin, deleteRequest);
router.put('/accept/:id', authorizeRole('freelancer'), acceptRequest);
router.put('/reject/:id', authorizeRole('freelancer'), rejectRequest);
router.get('/freelancer/:freelancerId', authorizeRole('freelancer'), getRequestsByFreelancer);
router.get('/client/:clientId', authorizeRole('client'), getRequestsByClient);

export default router;
