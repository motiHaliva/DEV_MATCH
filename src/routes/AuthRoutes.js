import express from 'express';
const router=express.Router();

import {
    signUp,
    login,
    logout} from '../controllers/AuthController.js';

    // Sign up
    router.post('/signup', signUp);
    // Login
    router.post('/login', login);
    // Logout
    router.get('/logout', logout);

    export default router;