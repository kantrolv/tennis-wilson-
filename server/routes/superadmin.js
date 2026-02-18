const express = require('express');
const router = express.Router();
const { getDashboard, createAdmin, deleteAdmin } = require('../controllers/superadminController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorize');

// All superadmin routes require authentication + superadmin role ONLY
router.use(authenticate);
router.use(authorize(['superadmin']));

router.get('/dashboard', getDashboard);
router.post('/create-admin', createAdmin);
router.delete('/delete-admin/:id', deleteAdmin);

module.exports = router;
