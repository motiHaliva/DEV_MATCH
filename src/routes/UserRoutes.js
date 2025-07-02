import express from 'express';
import { authorizeRole, authorizeSelfOrAdmin } from '../middleware/Authorize.js';

import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getMyProfile,
  updateMyProfile,
  getPublicUserProfile
} from '../controllers/UserController.js';

const router = express.Router();

router.get('/me', getMyProfile);  

router.put('/me', updateMyProfile);

router.get('/public/:id', getPublicUserProfile);            

router.get('/', getAllUsers);

router.post('/', createUser);

router.get('/:id', authorizeSelfOrAdmin, getUserById);

router.put('/:id', authorizeSelfOrAdmin, updateUser);

router.delete('/:id', authorizeSelfOrAdmin, deleteUser);
       
export default router;
