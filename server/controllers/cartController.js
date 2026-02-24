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

    console.log(`[Cart GET] User ${req.user._id} — ${cart.cartItems.length} items`);
    res.json(cart.cartItems);
});

// @desc    Sync cart (replace or merge)
// @route   POST /api/cart/sync
// @access  Private
const syncCart = asyncHandler(async (req, res) => {
    try {
        const { cartItems } = req.body;
        console.log(`[Cart SYNC] User ${req.user._id} — received ${cartItems ? cartItems.length : 0} items`);

        // ── Validate & sanitize incoming items ──────────────────────
        if (!Array.isArray(cartItems)) {
            res.status(400);
            throw new Error('cartItems must be an array');
        }

        const validItems = [];
        const droppedItems = [];

        for (const item of cartItems) {
            // Required fields per Cart schema: product, name, qty, cartId, price
            if (!item.product || !item.name || item.qty == null || !item.cartId || item.price == null) {
                droppedItems.push({
                    cartId: item.cartId || '(no cartId)',
                    reason: `Missing required field(s): ${[
                        !item.product && 'product',
                        !item.name && 'name',
                        item.qty == null && 'qty',
                        !item.cartId && 'cartId',
                        item.price == null && 'price',
                    ].filter(Boolean).join(', ')}`
                });
                continue;
            }

            // Ensure qty is a positive number
            const qty = Number(item.qty);
            if (isNaN(qty) || qty < 1) {
                droppedItems.push({
                    cartId: item.cartId,
                    reason: `Invalid qty: ${item.qty}`
                });
                continue;
            }

            validItems.push({
                product: item.product,
                name: item.name,
                imageUrl: item.imageUrl || '',
                price: Number(item.price),
                qty,
                gripSize: item.gripSize || 'N/A',
                string: item.string || undefined,
                cover: item.cover || undefined,
                cartId: item.cartId,
            });
        }

        if (droppedItems.length > 0) {
            console.warn(`[Cart SYNC] Dropped ${droppedItems.length} invalid items:`, droppedItems);
        }

        // ── Save to DB ──────────────────────────────────────────────
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                cartItems: validItems
            });
        } else {
            cart.cartItems = validItems;
            await cart.save();
        }

        console.log(`[Cart SYNC] Saved ${cart.cartItems.length} items for user ${req.user._id}`);
        res.json(cart.cartItems);
    } catch (error) {
        console.error("[Cart SYNC] Failed:", error);
        if (!res.statusCode || res.statusCode === 200) {
            res.status(500);
        }
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
    console.log(`[Cart CLEAR] Cleared cart for user ${req.user._id}`);
    res.json({ message: 'Cart cleared' });
});


module.exports = {
    getCart,
    syncCart,
    clearCart
};
