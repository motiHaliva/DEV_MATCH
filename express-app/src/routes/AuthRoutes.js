import express from 'express';
const router = express.Router();

import {
    signUp,
    login,
    logout,
    getCurrentUser

} from '../controllers/AuthController.js';


router.post('/signup', signUp);
router.post('/login', login);
router.post('/logout', logout);
router.get("/me", getCurrentUser);


export default router;