const express = require('express');
const router = express.Router();
const {
    getDashboard, addProduct, updateStock, updatePricing,
    getAnalytics, getLowStock, getOrders
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorize');

// All admin routes require authentication + admin or superadmin role
router.use(authenticate);
router.use(authorize(['admin', 'superadmin']));

router.get('/dashboard', getDashboard);
router.post('/add-product', addProduct);
router.put('/update-stock/:id', updateStock);
router.put('/update-pricing/:id', updatePricing);
router.get('/analytics', getAnalytics);
router.get('/low-stock', getLowStock);
router.get('/orders', getOrders);

module.exports = router;
