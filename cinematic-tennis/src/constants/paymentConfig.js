/**
 * Payment Configuration — region-based payment methods, tax, shipping, delivery
 * All amounts are in LOCAL currency for the respective region.
 */

// ── Payment Methods per Region ──────────────────────────────────────────────
export const PAYMENT_METHODS = {
    US: [
        { id: 'card', name: 'Credit/Debit Card', brands: ['Visa', 'Mastercard', 'Amex', 'Discover'], icon: '💳', type: 'card' },
        { id: 'paypal', name: 'PayPal', icon: 'paypal', type: 'wallet' },
        { id: 'apple_pay', name: 'Apple Pay', icon: 'apple', type: 'wallet' },
        { id: 'google_pay', name: 'Google Pay', icon: 'google', type: 'wallet' },
    ],
    GB: [
        { id: 'card', name: 'Credit/Debit Card', brands: ['Visa', 'Mastercard'], icon: '💳', type: 'card' },
        { id: 'paypal', name: 'PayPal', icon: 'paypal', type: 'wallet' },
        { id: 'apple_pay', name: 'Apple Pay', icon: 'apple', type: 'wallet' },
        { id: 'google_pay', name: 'Google Pay', icon: 'google', type: 'wallet' },
    ],
    IN: [
        { id: 'upi', name: 'UPI', icon: 'upi', type: 'upi' },
        { id: 'google_pay', name: 'Google Pay', icon: 'google', type: 'wallet' },
        { id: 'phonepe', name: 'PhonePe', icon: 'phonepe', type: 'wallet' },
        { id: 'paytm', name: 'Paytm', icon: 'paytm', type: 'wallet' },
        { id: 'card', name: 'Credit/Debit Card', brands: ['Visa', 'Mastercard', 'RuPay'], icon: '💳', type: 'card' },
        { id: 'cod', name: 'Cash on Delivery', icon: 'cod', type: 'cod' },
    ],
    JP: [
        { id: 'card', name: 'Credit/Debit Card', brands: ['Visa', 'Mastercard', 'JCB'], icon: '💳', type: 'card' },
        { id: 'paypay', name: 'PayPay', icon: 'paypay', type: 'wallet' },
        { id: 'apple_pay', name: 'Apple Pay', icon: 'apple', type: 'wallet' },
    ],
    AU: [
        { id: 'card', name: 'Credit/Debit Card', brands: ['Visa', 'Mastercard'], icon: '💳', type: 'card' },
        { id: 'paypal', name: 'PayPal', icon: 'paypal', type: 'wallet' },
        { id: 'apple_pay', name: 'Apple Pay', icon: 'apple', type: 'wallet' },
        { id: 'google_pay', name: 'Google Pay', icon: 'google', type: 'wallet' },
        { id: 'afterpay', name: 'Afterpay', icon: 'afterpay', type: 'bnpl' },
    ],
    AE: [
        { id: 'card', name: 'Credit/Debit Card', brands: ['Visa', 'Mastercard'], icon: '💳', type: 'card' },
        { id: 'apple_pay', name: 'Apple Pay', icon: 'apple', type: 'wallet' },
        { id: 'google_pay', name: 'Google Pay', icon: 'google', type: 'wallet' },
        { id: 'cod', name: 'Cash on Delivery', icon: 'cod', type: 'cod' },
    ],
    DE: [
        { id: 'card', name: 'Credit/Debit Card', brands: ['Visa', 'Mastercard'], icon: '💳', type: 'card' },
        { id: 'paypal', name: 'PayPal', icon: 'paypal', type: 'wallet' },
        { id: 'sepa', name: 'SEPA Direct Debit', icon: 'sepa', type: 'bank' },
    ],
    FR: [
        { id: 'card', name: 'Credit/Debit Card', brands: ['Visa', 'Mastercard'], icon: '💳', type: 'card' },
        { id: 'paypal', name: 'PayPal', icon: 'paypal', type: 'wallet' },
        { id: 'apple_pay', name: 'Apple Pay', icon: 'apple', type: 'wallet' },
        { id: 'carte_bancaire', name: 'Carte Bancaire', icon: 'cb', type: 'card' },
    ],
};

// ── Tax Rates (as decimal, e.g. 0.085 = 8.5%) ─────────────────────────────
export const TAX_RATES = {
    US: { rate: 0.085, label: 'Sales Tax (8.5%)' },
    GB: { rate: 0.20, label: 'VAT (20%)' },
    IN: { rate: 0.18, label: 'GST (18%)' },
    JP: { rate: 0.10, label: 'Consumption Tax (10%)' },
    AU: { rate: 0.10, label: 'GST (10%)' },
    AE: { rate: 0.05, label: 'VAT (5%)' },
    DE: { rate: 0.19, label: 'MwSt (19%)' },
    FR: { rate: 0.20, label: 'TVA (20%)' },
};

// ── Shipping Fees (in USD — will be multiplied by region multiplier) ───────
export const SHIPPING_FEES = {
    US: { fee: 9.99, freeAbove: 150, label: 'Standard Shipping' },
    GB: { fee: 7.99, freeAbove: 120, label: 'Royal Mail' },
    IN: { fee: 4.99, freeAbove: 80, label: 'Standard Delivery' },
    JP: { fee: 12.99, freeAbove: 200, label: 'Japan Post' },
    AU: { fee: 14.99, freeAbove: 200, label: 'Australia Post' },
    AE: { fee: 11.99, freeAbove: 150, label: 'Emirates Post' },
    DE: { fee: 6.99, freeAbove: 100, label: 'DHL Standard' },
    FR: { fee: 6.99, freeAbove: 100, label: 'La Poste' },
};

// ── Estimated Delivery Days ────────────────────────────────────────────────
export const DELIVERY_ESTIMATES = {
    US: { min: 3, max: 5 },
    GB: { min: 5, max: 7 },
    IN: { min: 5, max: 10 },
    JP: { min: 7, max: 12 },
    AU: { min: 7, max: 14 },
    AE: { min: 7, max: 12 },
    DE: { min: 4, max: 7 },
    FR: { min: 4, max: 7 },
};

// ── Helpers ────────────────────────────────────────────────────────────────

/** Get payment methods for a given region code */
export const getPaymentMethods = (regionCode) => PAYMENT_METHODS[regionCode] || PAYMENT_METHODS.US;

/** Calculate tax amount (pass subtotal already converted to local currency) */
export const calculateTax = (subtotalLocal, regionCode) => {
    const tax = TAX_RATES[regionCode] || TAX_RATES.US;
    return { amount: Math.round(subtotalLocal * tax.rate), label: tax.label };
};

/** Calculate shipping fee (pass subtotal in USD, returns fee in LOCAL currency) */
export const calculateShipping = (subtotalUSD, regionCode, multiplier) => {
    const ship = SHIPPING_FEES[regionCode] || SHIPPING_FEES.US;
    if (subtotalUSD >= ship.freeAbove) {
        return { amount: 0, label: ship.label, isFree: true };
    }
    return { amount: Math.round(ship.fee * multiplier), label: ship.label, isFree: false };
};

/** Get estimated delivery date range (returns { from: Date, to: Date }) */
export const getDeliveryEstimate = (regionCode) => {
    const est = DELIVERY_ESTIMATES[regionCode] || DELIVERY_ESTIMATES.US;
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() + est.min);
    const to = new Date(now);
    to.setDate(now.getDate() + est.max);
    return { from, to };
};

/** Generate a random order ID */
export const generateOrderId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'WLS-';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
