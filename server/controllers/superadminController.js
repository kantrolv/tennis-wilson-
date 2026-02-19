const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');
const generateToken = require('../utils/generateToken');

// For admin user creation (matches User model enum)
const VALID_REGIONS = ['US', 'GB', 'FR', 'DE', 'JP', 'AU', 'IN', 'AE'];

// For product-level stock/pricing (legacy keys in Product model)
const PRODUCT_REGIONS = ['india', 'usa', 'uk', 'uae'];
const REGION_CURRENCIES = { india: 'INR', usa: 'USD', uk: 'GBP', uae: 'AED' };
const LOW_STOCK_THRESHOLD = 10;

// ─── DASHBOARD ──────────────────────────────────────────────
// @desc    Get superadmin dashboard (global stats)
// @route   GET /api/superadmin/dashboard
// @access  Superadmin
const getDashboard = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalProducts = await Product.countDocuments();

    // Per-region stock + inventory value breakdown
    const agg = await Product.aggregate([
        {
            $group: {
                _id: null,
                indiaStock: { $sum: '$stock.india' },
                usaStock: { $sum: '$stock.usa' },
                ukStock: { $sum: '$stock.uk' },
                uaeStock: { $sum: '$stock.uae' },
                indiaValue: { $sum: { $multiply: ['$stock.india', '$pricing.india.price'] } },
                usaValue: { $sum: { $multiply: ['$stock.usa', '$pricing.usa.price'] } },
                ukValue: { $sum: { $multiply: ['$stock.uk', '$pricing.uk.price'] } },
                uaeValue: { $sum: { $multiply: ['$stock.uae', '$pricing.uae.price'] } },
            },
        },
    ]);

    const d = agg[0] || {};
    const regionStats = [
        { _id: 'india', totalStock: d.indiaStock || 0, inventoryValue: d.indiaValue || 0, currency: 'INR', productCount: totalProducts },
        { _id: 'usa', totalStock: d.usaStock || 0, inventoryValue: d.usaValue || 0, currency: 'USD', productCount: totalProducts },
        { _id: 'uk', totalStock: d.ukStock || 0, inventoryValue: d.ukValue || 0, currency: 'GBP', productCount: totalProducts },
        { _id: 'uae', totalStock: d.uaeStock || 0, inventoryValue: d.uaeValue || 0, currency: 'AED', productCount: totalProducts },
    ];

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

// ─── CREATE ADMIN ───────────────────────────────────────────
// @desc    Create a new regional admin
// @route   POST /api/superadmin/create-admin
// @access  Superadmin
const createAdmin = asyncHandler(async (req, res) => {
    const { name, email, password, region } = req.body;

    if (!name || !email || !password || !region) {
        res.status(400);
        throw new Error('Please provide name, email, password, and region');
    }

    if (!VALID_REGIONS.includes(region)) {
        res.status(400);
        throw new Error(`Invalid region. Must be one of: ${VALID_REGIONS.join(', ')}`);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists');
    }

    // HARD CODE role to 'admin' — NEVER trust body.role
    const admin = await User.create({
        name, email, password,
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

// ─── DELETE ADMIN ───────────────────────────────────────────
// @desc    Delete a regional admin
// @route   DELETE /api/superadmin/delete-admin/:id
// @access  Superadmin
const deleteAdmin = asyncHandler(async (req, res) => {
    const admin = await User.findById(req.params.id);

    if (!admin) {
        res.status(404);
        throw new Error('Admin not found');
    }

    if (admin.role !== 'admin') {
        res.status(400);
        throw new Error('Can only delete users with admin role');
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
        message: `Admin '${admin.email}' (${admin.region}) deleted successfully`,
    });
});

// ─── ANALYTICS ──────────────────────────────────────────────
// @desc    Get global inventory analytics
// @route   GET /api/superadmin/analytics
// @access  Superadmin
const getAnalytics = asyncHandler(async (req, res) => {
    const agg = await Product.aggregate([
        {
            $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                indiaStock: { $sum: '$stock.india' },
                usaStock: { $sum: '$stock.usa' },
                ukStock: { $sum: '$stock.uk' },
                uaeStock: { $sum: '$stock.uae' },
                indiaValue: { $sum: { $multiply: ['$stock.india', '$pricing.india.price'] } },
                usaValue: { $sum: { $multiply: ['$stock.usa', '$pricing.usa.price'] } },
                ukValue: { $sum: { $multiply: ['$stock.uk', '$pricing.uk.price'] } },
                uaeValue: { $sum: { $multiply: ['$stock.uae', '$pricing.uae.price'] } },
            },
        },
    ]);

    const d = agg[0] || {};
    const globalValue = (d.indiaValue || 0) + (d.usaValue || 0) + (d.ukValue || 0) + (d.uaeValue || 0);
    const globalStock = (d.indiaStock || 0) + (d.usaStock || 0) + (d.ukStock || 0) + (d.uaeStock || 0);

    // Low stock counts per region
    const lowStockCounts = {};
    for (const region of PRODUCT_REGIONS) {
        lowStockCounts[region] = await Product.countDocuments({
            [`stock.${region}`]: { $gt: 0, $lte: LOW_STOCK_THRESHOLD },
        });
    }

    res.json({
        analytics: {
            totalProducts: d.totalProducts || 0,
            globalStock,
            globalInventoryValue: globalValue,
            regions: {
                india: { stock: d.indiaStock || 0, inventoryValue: d.indiaValue || 0, currency: 'INR', lowStockCount: lowStockCounts.india },
                usa: { stock: d.usaStock || 0, inventoryValue: d.usaValue || 0, currency: 'USD', lowStockCount: lowStockCounts.usa },
                uk: { stock: d.ukStock || 0, inventoryValue: d.ukValue || 0, currency: 'GBP', lowStockCount: lowStockCounts.uk },
                uae: { stock: d.uaeStock || 0, inventoryValue: d.uaeValue || 0, currency: 'AED', lowStockCount: lowStockCounts.uae },
            },
        },
    });
});

// ─── LOW STOCK ──────────────────────────────────────────────
// @desc    Get low-stock products grouped by region
// @route   GET /api/superadmin/low-stock
// @access  Superadmin
const getLowStock = asyncHandler(async (req, res) => {
    const result = {};

    for (const region of PRODUCT_REGIONS) {
        const products = await Product.find({
            [`stock.${region}`]: { $lte: LOW_STOCK_THRESHOLD },
        }).select(`name brand model stock.${region} pricing.${region}`);

        result[region] = {
            count: products.length,
            currency: REGION_CURRENCIES[region],
            products: products.map((p) => ({
                _id: p._id,
                name: p.name,
                brand: p.brand,
                stock: p.stock[region],
                price: p.pricing[region]?.price,
                status: p.stock[region] === 0 ? 'out_of_stock' : 'low_stock',
            })),
        };
    }

    res.json({
        threshold: LOW_STOCK_THRESHOLD,
        lowStockByRegion: result,
    });
});

module.exports = {
    getDashboard,
    createAdmin,
    deleteAdmin,
    getAnalytics,
    getLowStock,
};
