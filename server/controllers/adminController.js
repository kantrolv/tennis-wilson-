const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Get admin dashboard data (region-filtered for admins)
// @route   GET /api/admin/dashboard
// @access  Admin, Superadmin
const getDashboard = asyncHandler(async (req, res) => {
    const query = {};

    // Admins see only their region — superadmin sees everything
    if (req.user.role === 'admin') {
        query.region = req.user.region;
    }

    const totalProducts = await Product.countDocuments(query);
    const totalStock = await Product.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$stock' } } },
    ]);

    res.json({
        region: req.user.role === 'admin' ? req.user.region : 'all',
        role: req.user.role,
        stats: {
            totalProducts,
            totalStock: totalStock[0]?.total || 0,
        },
    });
});

// @desc    Add a product (admin: auto-scoped to their region)
// @route   POST /api/admin/add-product
// @access  Admin, Superadmin
const addProduct = asyncHandler(async (req, res) => {
    const {
        name,
        brand,
        model,
        price,
        category,
        ageGroup,
        sport,
        weight,
        balance,
        material,
        gripStock,
        description,
        imageUrl,
        stock,
        region,
    } = req.body;

    // Admin: ALWAYS use their own region — never trust body.region
    // Superadmin: can specify any region
    let productRegion;
    if (req.user.role === 'admin') {
        productRegion = req.user.region;
    } else {
        // Superadmin must specify region
        if (!region) {
            res.status(400);
            throw new Error('Superadmin must specify a region for the product');
        }
        productRegion = region;
    }

    const product = await Product.create({
        name,
        brand,
        model,
        price,
        category,
        ageGroup,
        sport,
        weight,
        balance,
        material,
        gripStock,
        description,
        imageUrl,
        stock,
        region: productRegion,
    });

    res.status(201).json(product);
});

// @desc    Update product stock
// @route   PUT /api/admin/update-stock/:id
// @access  Admin, Superadmin
const updateStock = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Region restriction: admin can only update products in their region
    if (req.user.role === 'admin') {
        if (product.region !== req.user.region) {
            res.status(403);
            throw new Error(
                `Region mismatch: You can only manage products in '${req.user.region}'`
            );
        }
    }

    // Only allow updating stock — block region manipulation from admins
    product.stock = req.body.stock ?? product.stock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
});

module.exports = {
    getDashboard,
    addProduct,
    updateStock,
};
