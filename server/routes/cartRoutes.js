const express = require('express');
const router = express.Router();
const { getCart, syncCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getCart)
    .delete(protect, clearCart);

router.route('/sync')
    .post(protect, syncCart);

module.exports = router;
