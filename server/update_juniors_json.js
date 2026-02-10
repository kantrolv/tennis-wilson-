const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'wilson_package_enriched.json');

try {
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const products = JSON.parse(rawData);

    let updatedCount = 0;

    const updatedProducts = products.map(product => {
        if (product.name && /Jr/i.test(product.name)) {
            product.ageGroup = 'Junior';
            updatedCount++;
        } else {
            // Ensure other products have a default if missing, or leave as is (Schema handles default)
            // But to be explicit, let's leave them or set to Adult if we want to enforce it in JSON.
            // For now, only touching the ones requested.
            // Actually, if we want to ensure they are NOT Junior, we could set them to Adult explicitly if missing.
            if (!product.ageGroup) {
                product.ageGroup = 'Adult';
            }
        }
        return product;
    });

    fs.writeFileSync(dataPath, JSON.stringify(updatedProducts, null, 4));
    console.log(`Successfully updated ${updatedCount} products to 'Junior' ageGroup.`);

} catch (err) {
    console.error('Error updating JSON:', err);
}
