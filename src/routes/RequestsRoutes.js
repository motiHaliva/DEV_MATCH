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



// Get request by ID
router.get('/:id', getRequestById);

// Create a new request
router.post('/', createRequest);

// Delete a request
router.delete('/:id', deleteRequest);

// Accept a request
router.put('/accept/:id', acceptRequest);

// Reject a request
router.put('/reject/:id', rejectRequest);

// Get requests by freelancer
router.get('/freelancer/:freelancerId', getRequestsByFreelancer);

// Get requests by client
router.get('/client/:clientId', getRequestsByClient);

export default router;  