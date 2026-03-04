const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://kantrolvamshikrishnarao_db_user:pant@cluster0.gtdxg3d.mongodb.net/tennis_demo');

const VALID_REGIONS = ['india', 'usa', 'uk', 'uae', 'france', 'germany', 'japan', 'australia'];

async function migrate() {
    console.log("Starting raw DB migration...");
    const db = mongoose.connection;
    db.once('open', async () => {
        const products = db.collection('products');
        const all = await products.find({}).toArray();
        for (let p of all) {
            const rawGripStock = p.gripStock || {};
            // Check if it already has region keys
            const hasRegions = VALID_REGIONS.some(r => !!rawGripStock[r]);

            if (!hasRegions) {
                console.log("Migrating", p.name);

                let legacyGripStock = rawGripStock;
                // If it was empty or weird, default it safely
                if (Object.keys(legacyGripStock).length === 0) {
                    legacyGripStock = {
                        '4"(0)': 10,
                        '4-1/8"(1)': 10,
                        '4-1/4"(2)': 10,
                        '4-3/8"(3)': 10,
                        '4-1/2"(4)': 10,
                    };
                }

                let newGripStock = {};
                for (let r of VALID_REGIONS) {
                    newGripStock[r] = { ...legacyGripStock };
                }

                await products.updateOne({ _id: p._id }, { $set: { gripStock: newGripStock } });
            }
        }
        console.log("Done");
        process.exit();
    });
}

migrate().catch(console.error);
