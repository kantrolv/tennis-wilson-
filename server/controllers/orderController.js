const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');

const Product = require('../models/Product'); // Ensure Product is imported

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
    const {
        orderItems,
        totalPrice,
        shippingAddress
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
        return;
    } else {
        // 1. Validate and Deduct Stock Atomically for EACH item
        // This prevents race conditions.

        // Map user region to product stock key
        const regionMap = {
            'US': 'usa',
            'GB': 'uk',
            'IN': 'india',
            'AE': 'uae',
            'FR': 'france',
            'DE': 'germany',
            'JP': 'japan',
            'AU': 'australia'
        };
        const regionKey = regionMap[req.user.region] || 'usa'; // fallback to usa

        for (const item of orderItems) {
            let { product: productId, gripSize, qty } = item;

            // ── Normalize gripSize to find its actual DB key ──────────────
            // The cart might store "4 1/8", "4-1/8", or the full DB key "4-1/8\" (1)".
            // We extract just the numeric portion (e.g., "4-1/8") for fuzzy matching.
            const normalizeGripNumeric = (s) => {
                if (!s || s === 'N/A') return null;
                // Normalize spaces between digit and fraction ("4 1/8" → "4-1/8")
                const cleaned = (s + '').replace(/(\d)\s+(\d\/\d)/g, '$1-$2');
                // Extract numeric part: digits, hyphens, fractions. Ignore inch symbol and parenthetical.
                const m = cleaned.match(/(\d[\d\-\/]*\d|\d)/);
                return m ? m[1] : null;
            };

            const gripNumeric = normalizeGripNumeric(gripSize);

            // Fetch the product to find the actual matching key in the gripStock Map
            const checkProd = await Product.findById(productId);
            if (!checkProd) {
                res.status(400);
                throw new Error(`Product not found: ${item.name}`);
            }

            // Try to find the actual DB key that matches the selection
            let resolvedGripKey = null;
            const gripStockForRegion = checkProd.gripStock && checkProd.gripStock[regionKey];
            if (gripStockForRegion) {
                // First: exact match
                if (gripStockForRegion.get(gripSize) !== undefined) {
                    resolvedGripKey = gripSize;
                } else if (gripNumeric) {
                    // Second: fuzzy match on numeric portion
                    for (const [key] of gripStockForRegion) {
                        if (normalizeGripNumeric(key) === gripNumeric) {
                            resolvedGripKey = key;
                            break;
                        }
                    }
                }
            }

            // Sync item's gripSize to the resolved key (for order record accuracy)
            if (resolvedGripKey) {
                item.gripSize = resolvedGripKey;
            }

            let updatedProduct = null;

            if (resolvedGripKey && gripStockForRegion) {
                // We found the exact grip key — deduct both grip stock and region stock
                updatedProduct = await Product.findOneAndUpdate(
                    {
                        _id: productId,
                        [`gripStock.${regionKey}.${resolvedGripKey}`]: { $gte: qty },
                        [`stock.${regionKey}`]: { $gte: qty }
                    },
                    {
                        $inc: {
                            [`gripStock.${regionKey}.${resolvedGripKey}`]: -qty,
                            [`stock.${regionKey}`]: -qty
                        }
                    },
                    { new: true }
                );
            } else {
                // No grip stock data for this region/size — fall back to region stock only
                updatedProduct = await Product.findOneAndUpdate(
                    {
                        _id: productId,
                        [`stock.${regionKey}`]: { $gte: qty }
                    },
                    {
                        $inc: { [`stock.${regionKey}`]: -qty }
                    },
                    { new: true }
                );
            }

            if (!updatedProduct) {
                res.status(400);
                throw new Error(`Item ${item.name} (Grip: ${gripSize}) is out of stock in your region`);
                return; // Stop execution
            }
        }

        // 2. If all stock deductions successful, create order
        const order = new Order({
            user: req.user._id,
            region: regionKey,
            orderItems,
            totalPrice,
            shippingAddress,
            isDemo: true,
            isPaid: true
        });

        const createdOrder = await order.save();

        res.status(201).json(createdOrder);
    }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
        'user',
        'name email'
    );

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
});

module.exports = {
    addOrderItems,
    getOrderById,
    getMyOrders
};
