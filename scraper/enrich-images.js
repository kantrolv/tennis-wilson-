const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const INPUT_FILE = 'wilson-rackets.json';
const OUTPUT_FILE = 'wilson-rackets-with-images.json';

async function enrichImages() {
    try {
        console.log('📦 Reading product list...');
        const rawData = fs.readFileSync(INPUT_FILE, 'utf-8');
        const products = JSON.parse(rawData);

        console.log(`🔍 Found ${products.length} products to check.`);

        const enrichedProducts = [];

        for (let i = 0; i < products.length; i++) {
            const product = products[i];

            // Only fetch if missing image or placeholder
            if (product.image !== 'No Image Found' && !product.image.includes('placeholder')) {
                enrichedProducts.push(product);
                continue;
            }

            console.log(`[${i + 1}/${products.length}] Visiting: ${product.url}`);

            try {
                // Random delay to be polite and avoid WAF
                const delay = Math.floor(Math.random() * 2000) + 1000;
                await new Promise(r => setTimeout(r, delay));

                const { data } = await axios.get(product.url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Referer': 'https://www.wilson.com/en-us/tennis/rackets'
                    },
                    timeout: 10000
                });

                const $ = cheerio.load(data);

                // Strategy: Open Graph Image -> Twitter Image -> First Product Image
                let imageUrl = $('meta[property="og:image"]').attr('content') ||
                    $('meta[name="twitter:image"]').attr('content') ||
                    $('link[rel="image_src"]').attr('href');

                if (!imageUrl) {
                    // Fallback to finding the main gallery image
                    // This selector is a guess based on standard implementations, might need adjustment
                    imageUrl = $('.product-media img').first().attr('src') ||
                        $('img[class*="gallery"]').first().attr('src');
                }

                if (imageUrl) {
                    console.log(`   ✅ Found image: ${imageUrl.substring(0, 50)}...`);
                    product.image = imageUrl;
                } else {
                    console.log(`   ⚠️ No image found on page.`);
                }

            } catch (err) {
                console.error(`   ❌ Failed to fetch ${product.url}: ${err.message}`);
                if (err.response && err.response.status === 403) {
                    console.log("      (403 Forbidden - WAF blocked axios. You might need Puppeteer for this.)");
                }
            }

            enrichedProducts.push(product);
        }

        console.log(`💾 Saving enriched data to ${OUTPUT_FILE}...`);
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(enrichedProducts, null, 2));
        console.log('Done!');

    } catch (error) {
        console.error('Fatal Error:', error);
    }
}

enrichImages();
