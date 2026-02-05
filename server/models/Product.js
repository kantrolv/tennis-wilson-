const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    brand: {
        type: String,
        required: true,
        default: 'Wilson'
    },
    model: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    category: {
        type: String,
        required: true,
        default: 'racket'
    },
    sport: {
        type: String,
        required: true,
        default: 'tennis'
    },
    weight: {
        type: Number, // in grams
        required: true
    },
    balance: {
        type: String,
        required: true
    },
    material: {
        type: String,
        required: true
    },
    gripStock: {
        type: Map,
        of: Number,
        default: {}
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0 // Total stock cache
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
