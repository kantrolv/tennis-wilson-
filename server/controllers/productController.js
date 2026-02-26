const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Fetch all products with filters
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const {
        ageGroup,
        skillLevel,
        minPrice,
        maxPrice,
        brand,
        weight,
        keyword,
        region
    } = req.query;

    let query = {};

    if (region) {
        if (region !== 'all') {
            query.$or = [
                { addedByRegion: 'global' },
                { addedByRegion: region }
            ];
        }
    } else {
        query.addedByRegion = 'global';
    }

    if (ageGroup) {
        query.ageGroup = ageGroup;
    }

    if (skillLevel) {
        query.skillLevel = skillLevel;
    }

    if (brand) {
        query.brand = { $regex: brand, $options: 'i' }; // Case insensitive
    }

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Weight typically might look for a range or exact match. 
    // For simplicity, let's say "around" this weight or exact if needed.
    // Given the prompt implies simple filtering, let's assume exact or simple logic?
    // "Support query filters: weight". Let's do exact match for now or maybe a range if provided?
    // I'll stick to exact match or maybe allow a tolerance if needed, but exact is simpler for API specs.
    if (weight) {
        query.weight = Number(weight);
    }

    // Optional keyword search
    if (keyword) {
        query.name = {
            $regex: keyword,
            $options: 'i',
        };
    }

    const products = await Product.find(query);
    res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

module.exports = {
    getProducts,
    getProductById
};
