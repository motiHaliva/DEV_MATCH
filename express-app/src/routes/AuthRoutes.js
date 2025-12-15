// import express from 'express';
// const router = express.Router();

// import {
//     signUp,
//     login,
//     logout,
//     getCurrentUser

// } from '../controllers/AuthController.js';


// router.post('/signup', signUp);
// router.post('/login', login);
// router.post('/logout', logout);
// router.get("/me", getCurrentUser);


// export default router;

import express from 'express';
import passport from '../config/passport.js'; 
const router = express.Router();

import {
    signUp,
    login,
    logout,
    getCurrentUser,
    googleCallback,        // ✅ הוסף
    googleAuthFailed       // ✅ הוסף
} from '../controllers/AuthController.js';

// Regular auth
router.post('/signup', signUp);
router.post('/login', login);
router.post('/logout', logout);
router.get("/me", getCurrentUser);

// ✅ Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/auth/google/failure',
    session: false 
  }),
  googleCallback
);

router.get('/google/failure', googleAuthFailed);

export default router;