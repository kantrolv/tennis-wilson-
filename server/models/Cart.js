const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    cartItems: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product'
            },
            name: { type: String, required: true },
            imageUrl: { type: String },
            price: { type: Number, required: true },
            qty: { type: Number, required: true },
            gripSize: { type: String, default: 'N/A' },
            string: {
                id: { type: String },
                name: { type: String },
                price: { type: Number }
            },
            cover: {
                id: { type: String },
                name: { type: String },
                price: { type: Number }
            },
            cartId: { type: String, required: true } // Unique ID for frontend combination key
        }
    ]
}, {
    timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
