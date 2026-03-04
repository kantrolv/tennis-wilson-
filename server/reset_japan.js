const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb+srv://kantrolvamshikrishnarao_db_user:pant@cluster0.gtdxg3d.mongodb.net/tennis_demo');

const VALID_REGIONS = ['india', 'usa', 'uk', 'uae', 'france', 'germany', 'japan', 'australia'];

async function resetJapan() {
    console.log("Resetting Japan grip stock to 10 for Ultra 111...");

    // Find Ultra 111 explicitly
    const p = await Product.findOne({ name: /Ultra 111/ });
    if (p) {
        if (p.gripStock && p.gripStock.japan) {
            p.gripStock.japan.set('4-1/8" (1)', 10);
            p.markModified('gripStock');
            await p.save();
            console.log("Saved new Japan stock.");
        }
    }

    console.log("Done");
    process.exit();
}

resetJapan().catch(console.error);
