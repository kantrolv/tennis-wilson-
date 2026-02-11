const express = require('express');
const router = express.Router();
const { addAddress, deleteAddress, updateAddress } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/address').post(protect, addAddress);
router.route('/address/:id').delete(protect, deleteAddress).put(protect, updateAddress);

module.exports = router;
