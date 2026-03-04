const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb+srv://kantrolvamshikrishnarao_db_user:pant@cluster0.gtdxg3d.mongodb.net/tennis_demo');

async function check() {
    const p = await Product.findOne({ name: /Ultra 111/ });
    if (p) {
        console.log("Name:", p.name);
        console.log("Grip Stock Map:", p.gripStock);
        console.log("Region Stock:", p.stock);
    } else {
        console.log("Not found");
    }
    process.exit();
}
check();
