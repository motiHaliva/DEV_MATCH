
import express from 'express';

const router = express.Router();

import {getAllUsers,getUserById,createUser,updateUser,deleteUser} from '../controllers/UserController.js';

// קבלת כל המשתמשים
router.get('/', getAllUsers);

// קבלת משתמש לפי ID
router.get('/:id', getUserById);

// יצירת משתמש חדש
router.post('/', createUser);

// עדכון משתמש
router.put('/:id', updateUser);

// מחיקת משתמש
router.delete('/:id', deleteUser);

export default router;

