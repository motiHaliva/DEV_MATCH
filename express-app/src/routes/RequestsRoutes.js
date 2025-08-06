import express from 'express';
import { authorizeRole, authorizeSelfOrAdmin } from '../middleware/Authorize.js';
import {
    getAllRequests,
    getRequestById,
    createRequest,
    deleteRequest,
    acceptRequest,
    rejectRequest,
    getRequestsByFreelancer,
    getRequestsByClient,
    getMyRequests,
    getMyCreatedRequests,
    updateRequestStatus
} from '../controllers/RequestsController.js';

const router = express.Router();

// שליפת כל הבקשות (למנהלים) עם פילטרים ופאגינציה
router.get('/', authorizeRole('admin'), getAllRequests);

// שליפת הבקשות שלי (בקשות שנשלחו אליי - לכל המשתמשים)
router.get('/my-requests', getMyRequests);

// שליפת הבקשות שיצרתי (בקשות שיצרתי - לכל המשתמשים)
router.get('/my-created-requests', getMyCreatedRequests);
// שליפת בקשה ספציפית לפי ID
router.get('/:id', getRequestById);

// יצירת בקשה חדשה (לקוחות, פרילנסרים )


router.post('/', authorizeRole('admin', 'freelancer', 'client'), createRequest);

// אישור בקשה - עכשיו גם לקוחות וגם פרילנסרים יכולים לאשר
router.put('/accept/:id', acceptRequest);

// דחיית בקשה - עכשיו גם לקוחות וגם פרילנסרים יכולים לדחות
router.put('/reject/:id', rejectRequest);

// עדכון סטטוס בקשה (למנהלים)
router.put('/status/:id', authorizeRole('admin'), updateRequestStatus);

// מחיקת בקשה (רק למי שיצר אותה או מנהל)
router.delete('/:id', deleteRequest);

// שליפת בקשות לפי פרילנסר (למנהלים או לפרילנסר עצמו)
router.get('/freelancer/:freelancerId', getRequestsByFreelancer);

// שליפת בקשות לפי לקוח (למנהלים או ללקוח עצמו)
router.get('/client/:clientId', getRequestsByClient);

export default router;