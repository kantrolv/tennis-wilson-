const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    ageGroup: {
        type: String,
        required: true,
        enum: ['kids', 'adults']
    },
    skillLevel: {
        type: String,
        required: true,
        enum: ['beginner', 'intermediate', 'advanced']
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    weight: {
        type: Number, // in grams
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: [String],
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
