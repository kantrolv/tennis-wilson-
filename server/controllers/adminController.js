const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Product-level region keys (used in Product model schema)
const VALID_REGIONS = ['india', 'usa', 'uk', 'uae', 'france', 'germany', 'japan', 'australia'];
const REGION_CURRENCIES = { india: 'INR', usa: 'USD', uk: 'GBP', uae: 'AED', france: 'EUR', germany: 'EUR', japan: 'JPY', australia: 'AUD' };
const LOW_STOCK_THRESHOLD = 10;

// Maps user's 2-letter region code → product schema region key
const USER_TO_PRODUCT_REGION = {
    'US': 'usa', 'IN': 'india', 'GB': 'uk', 'AE': 'uae',
    'FR': 'france', 'DE': 'germany', 'JP': 'japan', 'AU': 'australia'
};

const getProductRegion = (userRegion) => USER_TO_PRODUCT_REGION[userRegion] || 'usa';

// ─── DASHBOARD ──────────────────────────────────────────────
// @desc    Get admin dashboard data (region-filtered for admins)
// @route   GET /api/admin/dashboard
// @access  Admin, Superadmin
const getDashboard = asyncHandler(async (req, res) => {
    const totalProducts = await Product.countDocuments();

    if (req.user.role === 'admin') {
        const region = getProductRegion(req.user.region);
        const stockField = `$stock.${region}`;
        const priceField = `$pricing.${region}.price`;

        const agg = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalStock: { $sum: stockField },
                    inventoryValue: { $sum: { $multiply: [stockField, priceField] } },
                },
            },
        ]);

        const lowStockCount = await Product.countDocuments({
            [`stock.${region}`]: { $gt: 0, $lte: LOW_STOCK_THRESHOLD },
        });
        const outOfStockCount = await Product.countDocuments({
            [`stock.${region}`]: 0,
        });

        res.json({
            region,
            role: 'admin',
            currency: REGION_CURRENCIES[region],
            stats: {
                totalProducts,
                totalStock: agg[0]?.totalStock || 0,
                inventoryValue: agg[0]?.inventoryValue || 0,
                lowStockCount,
                outOfStockCount,
            },
        });
    } else {
        // Superadmin sees global breakdown
        const agg = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    indiaStock: { $sum: '$stock.india' },
                    usaStock: { $sum: '$stock.usa' },
                    ukStock: { $sum: '$stock.uk' },
                    uaeStock: { $sum: '$stock.uae' },
                    franceStock: { $sum: '$stock.france' },
                    germanyStock: { $sum: '$stock.germany' },
                    japanStock: { $sum: '$stock.japan' },
                    australiaStock: { $sum: '$stock.australia' },
                    indiaValue: { $sum: { $multiply: ['$stock.india', '$pricing.india.price'] } },
                    usaValue: { $sum: { $multiply: ['$stock.usa', '$pricing.usa.price'] } },
                    ukValue: { $sum: { $multiply: ['$stock.uk', '$pricing.uk.price'] } },
                    uaeValue: { $sum: { $multiply: ['$stock.uae', '$pricing.uae.price'] } },
                    franceValue: { $sum: { $multiply: ['$stock.france', '$pricing.france.price'] } },
                    germanyValue: { $sum: { $multiply: ['$stock.germany', '$pricing.germany.price'] } },
                    japanValue: { $sum: { $multiply: ['$stock.japan', '$pricing.japan.price'] } },
                    australiaValue: { $sum: { $multiply: ['$stock.australia', '$pricing.australia.price'] } },
                },
            },
        ]);

        const d = agg[0] || {};
        res.json({
            region: 'all',
            role: 'superadmin',
            stats: {
                totalProducts,
                regionBreakdown: {
                    india: { stock: d.indiaStock || 0, inventoryValue: d.indiaValue || 0, currency: 'INR' },
                    usa: { stock: d.usaStock || 0, inventoryValue: d.usaValue || 0, currency: 'USD' },
                    uk: { stock: d.ukStock || 0, inventoryValue: d.ukValue || 0, currency: 'GBP' },
                    uae: { stock: d.uaeStock || 0, inventoryValue: d.uaeValue || 0, currency: 'AED' },
                    france: { stock: d.franceStock || 0, inventoryValue: d.franceValue || 0, currency: 'EUR' },
                    germany: { stock: d.germanyStock || 0, inventoryValue: d.germanyValue || 0, currency: 'EUR' },
                    japan: { stock: d.japanStock || 0, inventoryValue: d.japanValue || 0, currency: 'JPY' },
                    australia: { stock: d.australiaStock || 0, inventoryValue: d.australiaValue || 0, currency: 'AUD' },
                },
            },
        });
    }
});

// ─── ADD PRODUCT ────────────────────────────────────────────
// @desc    Add a product (global — pricing + stock per region)
// @route   POST /api/admin/add-product
// @access  Admin, Superadmin
const addProduct = asyncHandler(async (req, res) => {
    const {
        name, brand, model, price, category, ageGroup, sport,
        weight, balance, material, gripStock, description, imageUrl,
        stock, pricing,
    } = req.body;

    // Build regional stock
    let regionalStock = { india: 0, usa: 0, uk: 0, uae: 0, france: 0, germany: 0, japan: 0, australia: 0 };
    if (stock && typeof stock === 'object') {
        for (const key of VALID_REGIONS) {
            if (stock[key] !== undefined) {
                if (stock[key] < 0) {
                    res.status(400);
                    throw new Error(`Stock for '${key}' cannot be negative`);
                }
                regionalStock[key] = Number(stock[key]);
            }
        }
    }

    // Build regional pricing
    let regionalPricing = {
        india: { price: 0, currency: 'INR' },
        usa: { price: 0, currency: 'USD' },
        uk: { price: 0, currency: 'GBP' },
        uae: { price: 0, currency: 'AED' },
        france: { price: 0, currency: 'EUR' },
        germany: { price: 0, currency: 'EUR' },
        japan: { price: 0, currency: 'JPY' },
        australia: { price: 0, currency: 'AUD' },
    };
    if (pricing && typeof pricing === 'object') {
        for (const key of VALID_REGIONS) {
            if (pricing[key]?.price !== undefined) {
                if (pricing[key].price < 0) {
                    res.status(400);
                    throw new Error(`Price for '${key}' cannot be negative`);
                }
                regionalPricing[key].price = Number(pricing[key].price);
            }
        }
    } else if (price) {
        // If a simple global price is provided, set it as USA price and auto-convert
        regionalPricing.usa.price = Number(price);
        regionalPricing.india.price = Math.round(Number(price) * 83);
        regionalPricing.uk.price = Math.round(Number(price) * 0.79);
        regionalPricing.uae.price = Math.round(Number(price) * 3.67);
        regionalPricing.france.price = Math.round(Number(price) * 0.9);
        regionalPricing.germany.price = Math.round(Number(price) * 0.9);
        regionalPricing.japan.price = Math.round(Number(price) * 150);
        regionalPricing.australia.price = Math.round(Number(price) * 1.5);
    }

    let addedByRegion = 'global';
    if (req.user.role === 'admin') {
        addedByRegion = getProductRegion(req.user.region);
    } else if (req.user.role === 'superadmin' && req.body.region) {
        addedByRegion = req.body.region;
    }

    const product = await Product.create({
        name, brand, model,
        price: price || regionalPricing.usa.price, // Keep base price for backward compat
        pricing: regionalPricing,
        category, ageGroup, sport,
        weight, balance, material, gripStock, description, imageUrl,
        stock: regionalStock,
        addedByRegion,
    });

    res.status(201).json(product);
});

// ─── UPDATE STOCK ───────────────────────────────────────────
// @desc    Update product stock for a specific region
// @route   PUT /api/admin/update-stock/:id
// @access  Admin, Superadmin
const updateStock = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    let targetRegion;
    const newStock = Number(req.body.stock);

    if (isNaN(newStock) || newStock < 0) {
        res.status(400);
        throw new Error('Stock must be a non-negative number');
    }

    if (req.user.role === 'admin') {
        targetRegion = getProductRegion(req.user.region);
    } else {
        targetRegion = req.body.region;
        if (!targetRegion || !VALID_REGIONS.includes(targetRegion)) {
            res.status(400);
            throw new Error(`Superadmin must specify a valid region: ${VALID_REGIONS.join(', ')}`);
        }
    }

    product.stock[targetRegion] = newStock;
    product.markModified('stock');
    await product.save();

    res.json({
        message: 'Stock updated successfully',
        updatedRegion: targetRegion,
        newStock: product.stock[targetRegion],
    });
});

// ─── UPDATE PRICING ─────────────────────────────────────────
// @desc    Update product pricing for a specific region
// @route   PUT /api/admin/update-pricing/:id
// @access  Admin, Superadmin
const updatePricing = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const newPrice = Number(req.body.price);

    if (isNaN(newPrice) || newPrice < 0) {
        res.status(400);
        throw new Error('Price must be a non-negative number');
    }

    let targetRegion;

    if (req.user.role === 'admin') {
        targetRegion = getProductRegion(req.user.region);
    } else {
        targetRegion = req.body.region;
        if (!targetRegion || !VALID_REGIONS.includes(targetRegion)) {
            res.status(400);
            throw new Error(`Superadmin must specify a valid region: ${VALID_REGIONS.join(', ')}`);
        }
    }

    product.pricing[targetRegion].price = newPrice;
    product.pricing[targetRegion].currency = REGION_CURRENCIES[targetRegion];
    product.markModified('pricing');
    await product.save();

    res.json({
        message: 'Pricing updated successfully',
        updatedRegion: targetRegion,
        newPrice: product.pricing[targetRegion].price,
        currency: product.pricing[targetRegion].currency,
    });
});

// ─── ANALYTICS ──────────────────────────────────────────────
// @desc    Get inventory analytics for admin's region
// @route   GET /api/admin/analytics
// @access  Admin, Superadmin
const getAnalytics = asyncHandler(async (req, res) => {
    const region = req.user.role === 'admin' ? getProductRegion(req.user.region) : req.query.region;

    if (req.user.role === 'admin') {
        const stockField = `$stock.${region}`;
        const priceField = `$pricing.${region}.price`;

        const agg = await Product.aggregate([
            {
                $project: {
                    name: 1,
                    stock: stockField,
                    price: priceField,
                    value: { $multiply: [stockField, priceField] },
                },
            },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    totalStock: { $sum: '$stock' },
                    totalValue: { $sum: '$value' },
                    lowStockProducts: {
                        $push: {
                            $cond: [
                                { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', LOW_STOCK_THRESHOLD] }] },
                                { name: '$name', stock: '$stock', price: '$price' },
                                '$$REMOVE',
                            ],
                        },
                    },
                    outOfStockProducts: {
                        $push: {
                            $cond: [
                                { $eq: ['$stock', 0] },
                                { name: '$name' },
                                '$$REMOVE',
                            ],
                        },
                    },
                },
            },
        ]);

        const result = agg[0] || { totalProducts: 0, totalStock: 0, totalValue: 0, lowStockProducts: [], outOfStockProducts: [] };

        res.json({
            region,
            currency: REGION_CURRENCIES[region],
            analytics: {
                totalProducts: result.totalProducts,
                totalStock: result.totalStock,
                inventoryValue: result.totalValue,
                lowStockCount: result.lowStockProducts.length,
                outOfStockCount: result.outOfStockProducts.length,
                lowStockProducts: result.lowStockProducts,
                outOfStockProducts: result.outOfStockProducts,
            },
        });
    } else {
        // Superadmin: global analytics
        const agg = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    indiaStock: { $sum: '$stock.india' },
                    usaStock: { $sum: '$stock.usa' },
                    ukStock: { $sum: '$stock.uk' },
                    uaeStock: { $sum: '$stock.uae' },
                    franceStock: { $sum: '$stock.france' },
                    germanyStock: { $sum: '$stock.germany' },
                    japanStock: { $sum: '$stock.japan' },
                    australiaStock: { $sum: '$stock.australia' },
                    indiaValue: { $sum: { $multiply: ['$stock.india', '$pricing.india.price'] } },
                    usaValue: { $sum: { $multiply: ['$stock.usa', '$pricing.usa.price'] } },
                    ukValue: { $sum: { $multiply: ['$stock.uk', '$pricing.uk.price'] } },
                    uaeValue: { $sum: { $multiply: ['$stock.uae', '$pricing.uae.price'] } },
                    franceValue: { $sum: { $multiply: ['$stock.france', '$pricing.france.price'] } },
                    germanyValue: { $sum: { $multiply: ['$stock.germany', '$pricing.germany.price'] } },
                    japanValue: { $sum: { $multiply: ['$stock.japan', '$pricing.japan.price'] } },
                    australiaValue: { $sum: { $multiply: ['$stock.australia', '$pricing.australia.price'] } },
                },
            },
        ]);

        const d = agg[0] || {};
        const globalValue = (d.indiaValue || 0) + (d.usaValue || 0) + (d.ukValue || 0) + (d.uaeValue || 0) + (d.franceValue || 0) + (d.germanyValue || 0) + (d.japanValue || 0) + (d.australiaValue || 0);

        res.json({
            analytics: {
                totalProducts: d.totalProducts || 0,
                globalInventoryValue: globalValue,
                regions: {
                    india: { stock: d.indiaStock || 0, inventoryValue: d.indiaValue || 0, currency: 'INR' },
                    usa: { stock: d.usaStock || 0, inventoryValue: d.usaValue || 0, currency: 'USD' },
                    uk: { stock: d.ukStock || 0, inventoryValue: d.ukValue || 0, currency: 'GBP' },
                    uae: { stock: d.uaeStock || 0, inventoryValue: d.uaeValue || 0, currency: 'AED' },
                    france: { stock: d.franceStock || 0, inventoryValue: d.franceValue || 0, currency: 'EUR' },
                    germany: { stock: d.germanyStock || 0, inventoryValue: d.germanyValue || 0, currency: 'EUR' },
                    japan: { stock: d.japanStock || 0, inventoryValue: d.japanValue || 0, currency: 'JPY' },
                    australia: { stock: d.australiaStock || 0, inventoryValue: d.australiaValue || 0, currency: 'AUD' },
                },
            },
        });
    }
});

// ─── LOW STOCK ──────────────────────────────────────────────
// @desc    Get low-stock products for admin's region
// @route   GET /api/admin/low-stock
// @access  Admin, Superadmin
const getLowStock = asyncHandler(async (req, res) => {
    if (req.user.role === 'admin') {
        const region = getProductRegion(req.user.region);

        const products = await Product.find({
            [`stock.${region}`]: { $lte: LOW_STOCK_THRESHOLD },
        }).select(`name brand model imageUrl stock.${region} pricing.${region}`);

        const formatted = products.map((p) => ({
            _id: p._id,
            name: p.name,
            brand: p.brand,
            model: p.model,
            imageUrl: p.imageUrl,
            stock: p.stock[region],
            price: p.pricing[region]?.price,
            currency: p.pricing[region]?.currency,
            status: p.stock[region] === 0 ? 'out_of_stock' : 'low_stock',
        }));

        res.json({
            region,
            threshold: LOW_STOCK_THRESHOLD,
            count: formatted.length,
            products: formatted,
        });
    } else {
        // Superadmin: grouped by region
        const result = {};
        for (const region of VALID_REGIONS) {
            const products = await Product.find({
                [`stock.${region}`]: { $lte: LOW_STOCK_THRESHOLD },
            }).select(`name stock.${region} pricing.${region}`);

            result[region] = products.map((p) => ({
                _id: p._id,
                name: p.name,
                stock: p.stock[region],
                price: p.pricing[region]?.price,
                currency: p.pricing[region]?.currency,
                status: p.stock[region] === 0 ? 'out_of_stock' : 'low_stock',
            }));
        }

        res.json({
            threshold: LOW_STOCK_THRESHOLD,
            lowStockByRegion: result,
        });
    }
});

// ─── ORDERS ─────────────────────────────────────────────────
// @desc    Get orders for admin's region
// @route   GET /api/admin/orders
// @access  Admin, Superadmin
const getOrders = asyncHandler(async (req, res) => {
    let targetRegion;
    if (req.user.role === 'admin') {
        targetRegion = getProductRegion(req.user.region);
    } else {
        targetRegion = req.query.region || 'usa';
    }

    const orders = await Order.find({ region: targetRegion })
        .populate('user', 'name email region')
        .sort({ createdAt: -1 });

    res.json(orders);
});

module.exports = {
    getDashboard,
    addProduct,
    updateStock,
    updatePricing,
    getAnalytics,
    getLowStock,
    getOrders,
};
