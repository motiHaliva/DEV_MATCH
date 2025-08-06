import express from 'express';
import {
  getAllFreelancers,
  createFreelancer,
  updateFreelancer,
  deleteFreelancer,
  getMyFreelancerProfile,
  updateMyFreelancerProfile,
  getFullFreelancerProfile,
  getFreelancerReviews
} from '../controllers/FreelancerController.js';

import {
  authorizeRole,
  authorizeSelfOrAdmin
} from '../middleware/Authorize.js';

const router = express.Router();

/**
 * === SPECIFIC ROUTES FIRST (חשוב! לפני הרוטים הדינמיים) ===
 */

// פרופיל אישי - רק למשתמש המחובר
router.get('/me', authorizeRole('freelancer', 'admin'), getMyFreelancerProfile);
router.put('/me', authorizeRole('freelancer', 'admin'), updateMyFreelancerProfile);

// פרופיל ציבורי מלא של פרילנסר (כולל reviews)
router.get('/public/:userId', getFullFreelancerProfile);

// שליפת ביקורות בלבד של פרילנסר
router.get('/reviews/:userId', getFreelancerReviews);

/**
 * === ADMIN ROUTES ===
 */

// שליפת כל הפרילנסרים עם חיפוש, סינון, מיון ודפדוף
router.get('/', getAllFreelancers);

// יצירת פרופיל פרילנסר חדש
router.post('/', authorizeRole('freelancer', 'admin'), createFreelancer);

/**
 * === DYNAMIC ROUTES (בסוף!) ===
 */

// עדכון פרילנסר לפי ID (admin או הפרילנסר בעצמו)
router.put('/:id', authorizeSelfOrAdmin, updateFreelancer);

// מחיקת פרילנסר (רכה) - רק אדמין
router.delete('/:id', authorizeRole('admin'), deleteFreelancer);

export default router;