const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const axios = require('axios');
const pipeline = require('stream').pipeline;
const util = require('util');
const streamPipeline = util.promisify(pipeline);

// Load env vars from server directory
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const INPUT_FILE = path.join(__dirname, 'wilson-rackets.json');
const OUTPUT_FILE = path.join(__dirname, 'wilson-rackets.json'); // Overwriting as requested
const TEMP_DIR = path.join(__dirname, 'temp_images');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create temp directory if not exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

async function downloadImage(url, filepath) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    await streamPipeline(response.data, fs.createWriteStream(filepath));
}

async function runMigration() {
    console.log('🚀 Starting Cloudinary Single-Image Migration (Cleanup)...');

    // Check credentials
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME.includes('your_cloud_name')) {
        console.error('❌ ERROR: Cloudinary credentials not set in server/.env');
        process.exit(1);
    }

    const rawData = fs.readFileSync(INPUT_FILE, 'utf-8');
    let products = JSON.parse(rawData);
    console.log(`📦 Loaded ${products.length} products.`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });

    try {
        for (let i = 0; i < products.length; i++) {
            const product = products[i];

            // CLEANUP: Remove images array if exists
            if (product.images) {
                delete product.images;
            }

            console.log(`\n[${i + 1}/${products.length}] Processing: ${product.name}`);

            if (!product.url) {
                console.log(`   ⚠️  No Product URL. Skipping.`);
                continue;
            }

            const page = await browser.newPage();
            // Set User Agent to look like a real browser
            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
            await page.setViewport({ width: 1280, height: 800 });

            try {
                console.log(`   🌐 Visiting: ${product.url}`);
                await page.goto(product.url, { waitUntil: 'domcontentloaded', timeout: 60000 });

                const pageTitle = await page.title();
                const bodyLength = await page.evaluate(() => document.body.innerText.length);
                console.log(`   📄 Title: ${pageTitle}, Body Length: ${bodyLength}`);

                // Click to expand specs
                try {
                    await page.evaluate(() => {
                        // Find accordion header for Product Details or Specs
                        const headers = Array.from(document.querySelectorAll('.accordion-item, summary, button'));
                        const target = headers.find(el => el.innerText.includes('Specifications') || el.innerText.includes('Product Details'));
                        if (target) {
                            target.click();
                            // Also try finding a button inside
                            const btn = target.querySelector('button');
                            if (btn) btn.click();
                        }
                    });
                    await new Promise(r => setTimeout(r, 2000)); // Wait for expansion/load
                } catch (e) { }

                // Scrape Details
                const details = await page.evaluate(() => {
                    const getText = (selector) => {
                        const el = document.querySelector(selector);
                        return el ? el.innerText.trim() : '';
                    };

                    const getMeta = (name) => {
                        const el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
                        return el ? el.content : '';
                    };

                    // 1. Description
                    let description = getText('.product-description') || getText('#description') || getMeta('description') || getMeta('og:description');
                    // Cleanup description
                    description = description.replace(/\s+/g, ' ').substring(0, 500); // Limit length

                    // 2. Specs 
                    const specs = {
                        weight: null,
                        balance: null,
                        headSize: null,
                        length: null,
                        stringPattern: null
                    };

                    // New Logic: Iterate over .spec-card elements (usually in accordion)
                    const cards = document.querySelectorAll('.spec-card');
                    cards.forEach(card => {
                        const titleEl = card.querySelector('.spec-card-title');
                        const contentEl = card.querySelector('.spec-card-content');
                        if (titleEl && contentEl) {
                            const title = titleEl.textContent.toLowerCase();
                            const value = contentEl.textContent.trim();

                            if (title.includes('unstrung weight') || (title.includes('weight') && !title.includes('strung'))) {
                                // "280" or "300 g"
                                const match = value.match(/(\d+(\.\d+)?)/);
                                if (match) specs.weight = parseFloat(match[0]);
                            }
                            if (title.includes('unstrung balance') || (title.includes('balance') && !title.includes('strung'))) {
                                specs.balance = value; // Keep string "31.5"
                            }
                        }
                    });

                    // FALLBACK: Regex on entire body text (textContent includes hidden text)
                    if (!specs.weight || !specs.balance) {
                        const bodyText = document.body.textContent; // Includes hidden text
                        // Weight: "Unstrung Weight 300 g" or similar
                        // Wilson format often: "Unstrung Weight 300 g" or "Unstrung Weight: 300 g"
                        // Regex needs to be loose
                        const weightMatch = bodyText.match(/Unstrung Weight\s*[:\-]?\s*(\d+(\.\d+)?)\s*g/i);
                        if (weightMatch && !specs.weight) {
                            specs.weight = parseFloat(weightMatch[1]);
                        }

                        const balanceMatch = bodyText.match(/Unstrung Balance\s*[:\-]?\s*([\d\.]+)\s*cm/i);
                        if (balanceMatch && !specs.balance) {
                            specs.balance = balanceMatch[1];
                        }
                    }

                    // Material extraction (heuristic)
                    let material = "Carbon Fiber";
                    const pageText = document.body.innerText.toLowerCase();
                    if (pageText.includes('graphite')) material = "Graphite";
                    if (pageText.includes('blx')) material = "BLX / Carbon";
                    if (pageText.includes('braided')) material = "Braided Graphite";

                    return { description, specs, material };
                });

                // Try to find image URL (Single Image Logic as reverted)
                let imageUrl = await page.evaluate(() => {
                    // Try OG Image first (usually high res)
                    const ogImage = document.querySelector('meta[property="og:image"]');
                    if (ogImage) return ogImage.content;
                    // Try Gallery Image
                    const galleryImg = document.querySelector('.productView-image img') || document.querySelector('.slick-slide img');
                    if (galleryImg) return galleryImg.src;
                    return null;
                });

                if (!imageUrl) {
                    console.log(`   ❌ Could not find image on page.`);
                }

                if (imageUrl && !imageUrl.includes('cloudinary')) {
                    console.log(`   📷 Found New Image: ${imageUrl}`);
                    // Download & Upload Logic
                    try {
                        const extension = imageUrl.split('.').pop().split(/[?#]/)[0] || 'jpg';
                        const tempFilePath = path.join(TEMP_DIR, `${product.model.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.${extension}`);
                        await downloadImage(imageUrl, tempFilePath);

                        console.log(`   ☁️  Uploading to Cloudinary...`);
                        const sanitizedName = product.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
                        const result = await cloudinary.uploader.upload(tempFilePath, {
                            folder: 'wilson/rackets',
                            public_id: sanitizedName,
                            overwrite: true
                        });
                        imageUrl = result.secure_url;
                        console.log(`   ✅ Uploaded: ${imageUrl}`);
                        fs.unlinkSync(tempFilePath);
                    } catch (e) {
                        console.error(`   ⚠️ Image upload failed: ${e.message}`);
                    }
                } else if (!imageUrl && (!product.image || product.image === "No Image Found")) {
                    // Only set to "No Image Found" if we really have nothing
                    imageUrl = "No Image Found";
                } else if (!imageUrl && product.image) {
                    imageUrl = product.image; // Keep old one
                }

                // Update Product Object to match User Request
                product.brand = "Wilson"; // Hardcoded as requested
                product.category = "racket";
                product.sport = "tennis";
                // Fallbacks if not found on page
                product.weight = details.specs.weight || 300;
                product.balance = details.specs.balance ? `${details.specs.balance} cm` : "32 cm"; // Append cm if missing/likely raw number
                product.material = details.material;
                product.gripSize = "4 3/8"; // Default
                product.description = details.description || `The ${product.name} offers premium performance.`;
                product.imageUrl = imageUrl;
                product.stock = 20; // Default

                // Cleanup old fields
                if (product.image) delete product.image;
                if (product.images) delete product.images;

                console.log(`   ✅ Enriched Data: Weight=${product.weight}g, Balance=${product.balance}`);

                // Save Partial Progress
                fs.writeFileSync(OUTPUT_FILE, JSON.stringify(products, null, 2));

            } catch (err) {
                console.error(`   ❌ Error processing ${product.name}: ${err.message}`);
            } finally {
                await page.close();
            }

            // Random delay to be polite
            const delay = Math.floor(Math.random() * 1000) + 500;
            await new Promise(r => setTimeout(r, delay));
        }

        // Final save to ensure all cleanups (deletions of 'images') are persisted even if we skipped downloads
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(products, null, 2));

    } catch (err) {
        console.error('Fatal Error:', err);
    } finally {
        await browser.close();
        if (fs.existsSync(TEMP_DIR)) {
            try { fs.rmdirSync(TEMP_DIR, { recursive: true }); } catch (e) { }
        }
        console.log('\n✨ Single-Image Migration Complete!');
    }
}

runMigration();
