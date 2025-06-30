import express from 'express';
import {
  getAll,
  assignToUser,
  getByUserId,
  removeFromUser,
} from '../controllers/SkillController.js';

import { authorizeRole } from '../middleware/Authorize.js';

const router = express.Router();

router.get('/', getAll);

router.post('/',authorizeRole('freelancer'),assignToUser);

router.get('/user/:userId', getByUserId);

router.delete('/:skillId', authorizeRole('freelancer'),removeFromUser);

export default router;
