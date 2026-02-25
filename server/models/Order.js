const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    region: {
        type: String,
        required: true,
        default: 'usa'
    },
    shippingAddress: {
        fullName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        label: { type: String }
    },
    orderItems: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            gripSize: { type: String, required: true }, // Size stored in order
            imageUrl: { type: String }, // optional, for display
            price: { type: Number, required: true },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product'
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    isDemo: {
        type: Boolean,
        default: true
    },
    isPaid: {
        type: Boolean,
        default: true // It's a demo, so auto-paid
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
