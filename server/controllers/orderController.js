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
            const { product: productId, gripSize, qty } = item;

            // Atomic Update: Decrement stock ONLY if > 0
            // Syntax for Map/Object nested key: "gripStock.4-1/2"
            const updatedProduct = await Product.findOneAndUpdate(
                {
                    _id: productId,
                    [`gripStock.${gripSize}`]: { $gte: qty }, // Ensure enough grip stock
                    [`stock.${regionKey}`]: { $gte: qty }     // Ensure enough region stock
                },
                {
                    $inc: {
                        [`gripStock.${gripSize}`]: -qty,    // Deduct grip stock
                        [`stock.${regionKey}`]: -qty        // Deduct region stock
                    }
                },
                { new: true }
            );

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
