// Regions that have dedicated pricing stored in the Product model
// Only these use stored product.pricing[key]; all others use multiplier conversion
const DEDICATED_PRICING_REGIONS = {
    US: 'usa', IN: 'india', GB: 'uk', AE: 'uae',
};

// Maps frontend region codes to backend region keys (for product queries)
export const REGION_MAP = {
    US: 'usa', IN: 'india', GB: 'uk', AE: 'uae',
    FR: 'usa', DE: 'usa', JP: 'usa', AU: 'usa',
};

// Currency symbols by ISO code
export const CURRENCY_SYMBOLS = {
    INR: '₹', USD: '$', GBP: '£', AED: 'د.إ',
    EUR: '€', JPY: '¥', AUD: 'A$',
};

/**
 * Get the price + currency for a product in the user's region.
 * - Regions with dedicated product pricing (US, IN, GB, AE): use stored price
 * - Other regions (FR, DE, JP, AU): convert base USD price using region multiplier
 */
export function getRegionalPrice(product, region) {
    const dedicatedKey = DEDICATED_PRICING_REGIONS[region.countryCode];

    // If this region has dedicated pricing in the product model, use it
    if (dedicatedKey) {
        const rp = product?.pricing?.[dedicatedKey];
        if (rp && rp.price !== undefined) {
            return {
                price: rp.price,
                currency: rp.currency,
                symbol: CURRENCY_SYMBOLS[rp.currency] || '$',
            };
        }
    }

    // For all other regions (JP, FR, DE, AU etc.) — convert base USD price
    const basePrice = product?.pricing?.usa?.price ?? product?.price ?? 0;
    return {
        price: Math.round(basePrice * region.multiplier),
        currency: region.currency,
        symbol: region.currencySymbol,
    };
}

/**
 * Format a price amount using the user's region pricing.
 * For add-on prices (strings, covers) that are stored in USD,
 * convert using the regional multiplier or pricing ratio.
 */
export function formatAddonPrice(addonPriceUSD, product, region) {
    const dedicatedKey = DEDICATED_PRICING_REGIONS[region.countryCode];

    if (dedicatedKey) {
        const rp = product?.pricing?.[dedicatedKey];
        if (rp && rp.price !== undefined && product.price > 0) {
            const ratio = rp.price / product.price;
            const converted = Math.round(addonPriceUSD * ratio);
            const symbol = CURRENCY_SYMBOLS[rp.currency] || '$';
            return { amount: converted, formatted: `${symbol}${converted.toLocaleString()}` };
        }
    }

    // Convert using region multiplier for all other regions
    const converted = Math.round(addonPriceUSD * region.multiplier);
    return { amount: converted, formatted: `${region.currencySymbol}${converted.toLocaleString()}` };
}
