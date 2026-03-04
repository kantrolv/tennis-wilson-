const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
mongoose.connect(process.env.MONGO_URI).then(async () => {
    const products = await Product.find({});
    for (let p of products) {
        console.log(`Product: ${p.name}, ID: ${p._id}`);
        console.log(`  Grip (usa) before: `, p.gripStock && p.gripStock.usa ? p.gripStock.usa : 'None');

        const regionKey = 'usa';
        const gripSize = '4-1/4" (2)';
        const qty = 1;

        let updatedProduct = await Product.findOneAndUpdate(
            {
                _id: p._id,
                [`gripStock.${regionKey}.${gripSize}`]: { $gte: qty },
                [`stock.${regionKey}`]: { $gte: qty }
            },
            {
                $inc: {
                    [`gripStock.${regionKey}.${gripSize}`]: -qty,
                    [`stock.${regionKey}`]: -qty
                }
            },
            { new: true }
        );

        console.log('Result of update = ', updatedProduct ? 'Success' : 'Failed - not found or insufficient stock');
        if (updatedProduct) {
            console.log(`  Stock (usa) after: `, updatedProduct.stock.usa);
            console.log(`  Grip (usa) after: `, updatedProduct.gripStock.usa.get(gripSize));
        }

        break; // just check one
    }
    process.exit(0);
}).catch(console.error);
