const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');

// Public routes
router.get('/oauth', authController.getOAuthUrl);
router.post('/callback', authController.handleOAuthCallback);
router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.post('/signout', authenticateUser, authController.signOut);
router.get('/profile', authenticateUser, authController.getProfile);
router.put('/profile', authenticateUser, authController.updateProfile);

module.exports = router;