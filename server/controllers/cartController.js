const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        // If no cart exists for user, return empty items (or create empty one)
        cart = await Cart.create({
            user: req.user._id,
            cartItems: []
        });
    }

    res.json(cart.cartItems);
});

// @desc    Sync cart (replace or merge)
// @route   POST /api/cart/sync
// @access  Private
const syncCart = asyncHandler(async (req, res) => {
    try {
        const { cartItems } = req.body;
        console.log("Syncing cart for user:", req.user._id);

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                cartItems: cartItems
            });
        } else {
            cart.cartItems = cartItems;
            await cart.save();
        }

        console.log("Cart synced successfully.");
        res.json(cart.cartItems);
    } catch (error) {
        console.error("Cart sync failed:", error);
        res.status(500);
        throw new Error('Cart sync failed: ' + error.message);
    }
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
        cart.cartItems = [];
        await cart.save();
    }
    res.json({ message: 'Cart cleared' });
});


module.exports = {
    getCart,
    syncCart,
    clearCart
};
