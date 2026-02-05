const fs = require('fs');
const path = require('path');

// Path to your existing data
const sourcePath = path.join(__dirname, '../../scraper/wilson-rackets.json');
const outputPath = path.join(__dirname, '../../server/data/wilson_package_enriched.json');

const gripOptions = [
    "4\" (0)",
    "4-1/8\" (1)",
    "4-1/4\" (2)",
    "4-3/8\" (3)",
    "4-1/2\" (4)"
];

try {
    const rawData = fs.readFileSync(sourcePath, 'utf-8');
    const products = JSON.parse(rawData);

    const enrichedProducts = products.map(product => {
        // Create gripStock map (object in JSON)
        const gripStock = {};
        gripOptions.forEach(size => {
            gripStock[size] = 5; // Default stock
        });

        // Calculate total stock
        const totalStock = Object.values(gripStock).reduce((acc, curr) => acc + curr, 0);

        return {
            ...product,
            gripStock: gripStock, // New Map structure
            stock: totalStock, // Update total stock
            // Remove old simple field if it exists, or keep for reference? 
            // Better to keep clean.
        };
    });

    // Write back
    fs.writeFileSync(outputPath, JSON.stringify(enrichedProducts, null, 4));
    console.log(`Successfully enriched ${enrichedProducts.length} products with inventory.`);
    console.log(`Saved to ${outputPath}`);

} catch (err) {
    console.error("Error transforming data:", err);
}
