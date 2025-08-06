import express from 'express';
import {getAll,
  assignToUser,
  getByUserId,
  removeFromUser,
} from '../controllers/TitleController.js';

import { authorizeRole } from '../middleware/Authorize.js';

const router = express.Router();

// כל הטייטלים
router.get('/', getAll);

// פרילנס מוסיף לעצמו טייטל
router.post('/',authorizeRole('freelancer'),assignToUser);

// שליפת טייטלים לפי userId (למשל לאדמין)
router.get('/user/:userId', getByUserId);

// פרילנס מסיר טייטל מעצמ
router.delete('/:titleId',authorizeRole('freelancer'),removeFromUser);

export default router;
