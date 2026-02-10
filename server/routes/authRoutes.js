const express = require('express');
const router = express.Router();
const { authUser, registerUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', registerUser);
router.post('/login', authUser);
router.get('/me', protect, getMe);

module.exports = router;
