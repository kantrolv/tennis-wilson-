const mongoose = require('mongoose');

const regionPricingSchema = new mongoose.Schema({
    price: { type: Number, default: 0 },
    currency: { type: String, required: true },
}, { _id: false });

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
    // Global base price kept for backward compatibility & filtering
    price: {
        type: Number,
        required: true,
        default: 0
    },
    pricing: {
        india: { type: regionPricingSchema, default: () => ({ price: 0, currency: 'INR' }) },
        usa: { type: regionPricingSchema, default: () => ({ price: 0, currency: 'USD' }) },
        uk: { type: regionPricingSchema, default: () => ({ price: 0, currency: 'GBP' }) },
        uae: { type: regionPricingSchema, default: () => ({ price: 0, currency: 'AED' }) },
        france: { type: regionPricingSchema, default: () => ({ price: 0, currency: 'EUR' }) },
        germany: { type: regionPricingSchema, default: () => ({ price: 0, currency: 'EUR' }) },
        japan: { type: regionPricingSchema, default: () => ({ price: 0, currency: 'JPY' }) },
        australia: { type: regionPricingSchema, default: () => ({ price: 0, currency: 'AUD' }) },
    },
    category: {
        type: String,
        required: true,
        default: 'racket'
    },
    ageGroup: {
        type: String,
        required: true,
        default: 'Adult',
        enum: ['Adult', 'Junior']
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
        india: { type: Number, default: 0 },
        usa: { type: Number, default: 0 },
        uk: { type: Number, default: 0 },
        uae: { type: Number, default: 0 },
        france: { type: Number, default: 0 },
        germany: { type: Number, default: 0 },
        japan: { type: Number, default: 0 },
        australia: { type: Number, default: 0 },
    },
    addedByRegion: {
        type: String,
        default: 'global'
    }
}, {
    timestamps: true
});

// Indexes for fast low-stock queries per region
productSchema.index({ 'stock.india': 1 });
productSchema.index({ 'stock.usa': 1 });
productSchema.index({ 'stock.uk': 1 });
productSchema.index({ 'stock.uae': 1 });
productSchema.index({ 'stock.france': 1 });
productSchema.index({ 'stock.germany': 1 });
productSchema.index({ 'stock.japan': 1 });
productSchema.index({ 'stock.australia': 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
