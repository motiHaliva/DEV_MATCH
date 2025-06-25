import express from 'express';
import { authorizeRole, authorizeSelfOrAdmin } from '../middleware/Authorize.js';

import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/UserController.js';

const router = express.Router();

router.get('/', authorizeRole('admin'), getAllUsers);

router.get('/:id', authorizeSelfOrAdmin, getUserById);

router.post('/', authorizeRole('admin'), createUser);

router.put('/:id', authorizeSelfOrAdmin, updateUser);

router.delete('/:id', authorizeSelfOrAdmin, deleteUser);

export default router;
