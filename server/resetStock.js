/**
 * Reset Stock Script
 * 
 * Sets equal stock for every product:
 * - 5 grip sizes, each with 10 units = 50 total gripStock per product
 * - 50 regional stock for each of the 8 regions
 * 
 * This ensures the gripStock total matches the per-region stock,
 * so when a user buys from India (or any region), both gripStock
 * and region stock get decremented, and the India admin dashboard
 * will see the order + updated stock.
 * 
 * Usage: node resetStock.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Product = require('./models/Product');

dotenv.config();

const GRIP_SIZES = [
    '4" (0)',
    '4-1/8" (1)',
    '4-1/4" (2)',
    '4-3/8" (3)',
    '4-1/2" (4)'
];
const STOCK_PER_GRIP = 10;
const TOTAL_STOCK_PER_REGION = GRIP_SIZES.length * STOCK_PER_GRIP; // 5 × 10 = 50

const resetStock = async () => {
    try {
        await connectDB();

        const products = await Product.find({});
        console.log(`\nFound ${products.length} products. Resetting stock...\n`);

        for (const product of products) {
            // Build gripStock map: 10 units per grip size
            const gripStock = {};
            for (const size of GRIP_SIZES) {
                gripStock[size] = STOCK_PER_GRIP;
            }

            // Set 50 stock for every region
            const stock = {
                india: TOTAL_STOCK_PER_REGION,
                usa: TOTAL_STOCK_PER_REGION,
                uk: TOTAL_STOCK_PER_REGION,
                uae: TOTAL_STOCK_PER_REGION,
                france: TOTAL_STOCK_PER_REGION,
                germany: TOTAL_STOCK_PER_REGION,
                japan: TOTAL_STOCK_PER_REGION,
                australia: TOTAL_STOCK_PER_REGION,
            };

            product.gripStock = gripStock;
            product.stock = stock;
            product.markModified('gripStock');
            product.markModified('stock');
            await product.save();

            console.log(`✅  ${product.name}`);
            console.log(`    Grip Stock: ${GRIP_SIZES.map(s => `${s}=${STOCK_PER_GRIP}`).join(', ')}`);
            console.log(`    Region Stock: 50 per region (8 regions)\n`);
        }

        console.log(`\n🎾 Done! All ${products.length} products now have:`);
        console.log(`   • ${STOCK_PER_GRIP} units per grip size (${GRIP_SIZES.length} sizes)`);
        console.log(`   • ${TOTAL_STOCK_PER_REGION} units per region (8 regions)`);
        console.log(`   • Total: ${TOTAL_STOCK_PER_REGION} units available per product per region\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting stock:', error);
        process.exit(1);
    }
};

resetStock();
