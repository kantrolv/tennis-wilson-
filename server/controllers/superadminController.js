const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');
const generateToken = require('../utils/generateToken');

// @desc    Get superadmin dashboard (global stats)
// @route   GET /api/superadmin/dashboard
// @access  Superadmin
const getDashboard = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalProducts = await Product.countDocuments();

    // Per-region breakdown
    const regionStats = await Product.aggregate([
        {
            $group: {
                _id: '$region',
                productCount: { $sum: 1 },
                totalStock: { $sum: '$stock' },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    // Admin list
    const admins = await User.find({ role: 'admin' })
        .select('name email region createdAt')
        .sort({ createdAt: -1 });

    res.json({
        role: 'superadmin',
        stats: {
            totalUsers,
            totalAdmins,
            totalProducts,
        },
        regionStats,
        admins,
    });
});

// @desc    Create a new regional admin
// @route   POST /api/superadmin/create-admin
// @access  Superadmin
const createAdmin = asyncHandler(async (req, res) => {
    const { name, email, password, region } = req.body;

    // Validate required fields
    if (!name || !email || !password || !region) {
        res.status(400);
        throw new Error('Please provide name, email, password, and region');
    }

    // Validate region
    const validRegions = ['india', 'usa', 'uk', 'uae'];
    if (!validRegions.includes(region)) {
        res.status(400);
        throw new Error(`Invalid region. Must be one of: ${validRegions.join(', ')}`);
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists');
    }

    // HARD CODE role to 'admin' — NEVER trust body.role
    const admin = await User.create({
        name,
        email,
        password,
        role: 'admin',
        region,
    });

    if (admin) {
        res.status(201).json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            region: admin.region,
            token: generateToken(admin),
        });
    } else {
        res.status(400);
        throw new Error('Failed to create admin');
    }
});

// @desc    Delete a regional admin
// @route   DELETE /api/superadmin/delete-admin/:id
// @access  Superadmin
const deleteAdmin = asyncHandler(async (req, res) => {
    const admin = await User.findById(req.params.id);

    if (!admin) {
        res.status(404);
        throw new Error('Admin not found');
    }

    // Safety: only allow deleting admin-role users
    if (admin.role !== 'admin') {
        res.status(400);
        throw new Error('Can only delete users with admin role');
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
        message: `Admin '${admin.email}' (${admin.region}) deleted successfully`,
    });
});

module.exports = {
    getDashboard,
    createAdmin,
    deleteAdmin,
};
