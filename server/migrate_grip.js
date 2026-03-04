const mongoose = require('mongoose');
const Product = require('./models/Product');
const dotenv = require('dotenv');

dotenv.config({ path: '../cinematic-tennis/.env' });

const VALID_REGIONS = ['india', 'usa', 'uk', 'uae', 'france', 'germany', 'japan', 'australia'];

mongoose.connect(process.env.VITE_API_URL ? process.env.VITE_API_URL.replace('api', '') : 'mongodb+srv://kantrolvamshikrishnarao_db_user:pant@cluster0.gtdxg3d.mongodb.net/tennis_demo');

async function migrate() {
    console.log("Starting migration...");
    const products = await Product.find({});

    for (let p of products) {
        // If gripStock is a direct Map of strings (e.g. contains '4 1/4" (2)')
        // Mongoose might have returned it weirdly, let's look at raw JSON
        const raw = p.toJSON();

        let needsMigration = false;

        // Check if root has keys like '4 1/4" (2)' instead of region names
        const keys = Object.keys(raw.gripStock || {});
        const hasLegacyKeys = keys.some(k => k.includes('"'));

        if (hasLegacyKeys || keys.length === 0 || !keys.includes('usa')) {
            needsMigration = true;
        }

        if (needsMigration) {
            console.log(`Migrating ${p.name}...`);
            // Extracted old global stock or use defaults
            let legacyGripStock = {};
            if (hasLegacyKeys) {
                legacyGripStock = { ...raw.gripStock };
            } else {
                legacyGripStock = {
                    "4 1/4\" (2)": 10,
                    "4 3/8\" (3)": 10,
                    "4-1/2\" (4)": 10,
                    "4-1/8\" (1)": 10,
                    "4\" (0)": 10
                };
            }

            // Rebuild
            let newRegionalGripStock = {};
            for (let r of VALID_REGIONS) {
                newRegionalGripStock[r] = { ...legacyGripStock };
            }

            p.gripStock = newRegionalGripStock;

            // Mark modified for the entire object so mongoose saves it properly
            p.markModified('gripStock');
            await p.save();
        }
    }
    console.log("Migration complete.");
    process.exit();
}

migrate().catch(console.error);
