const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const BASE_URL = 'https://www.wilson.com/en-us/tennis/rackets';
const OUTPUT_FILE = 'wilson-rackets.json';
const TARGET_COUNT = 50;

async function scrapeWilson() {
    console.log(`🎾 Starting scrape for Wilson Tennis Rackets using Puppeteer...`);

    // Launch browser
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set a real user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

    // Optimize: Block fonts only, allow images to ensuring lazy loading attributes populate
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['font'].includes(req.resourceType())) {
            req.abort();
        } else {
            req.continue();
        }
    });

    try {
        console.log(`   Navigating to ${BASE_URL}...`);
        await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 60000 });

        // Handle Cookie Modal if it appears
        try {
            const cookieBtn = await page.waitForSelector('button:contains("That\'s OK")', { timeout: 5000 }).catch(() => null);
            if (cookieBtn) await cookieBtn.click();
        } catch (e) { /* ignore */ }

        // Infinite Scroll
        console.log(`   Scrolling to load products...`);
        let previousHeight = 0;
        let attempts = 0;
        while (attempts < 6) {
            previousHeight = await page.evaluate('document.body.scrollHeight');
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
            await new Promise(r => setTimeout(r, 2000));

            const newHeight = await page.evaluate('document.body.scrollHeight');
            if (newHeight === previousHeight) attempts++;
            else attempts = 0;
        }

        // Extract Data directly via DOM to ensure we get computed src
        const products = await page.evaluate(() => {
            const items = [];
            const seen = new Set();

            // Query all product links
            const cards = document.querySelectorAll('a[href*="/product/"]');

            cards.forEach(el => {
                // Name
                // Try multiple common selectors for name
                let name = el.querySelector('.product-name')?.innerText ||
                    el.querySelector('.title')?.innerText ||
                    el.querySelector('.ds-sdk-product-item__product-name')?.innerText;

                // Fallback: Check for divs with significant text
                if (!name) {
                    const divs = Array.from(el.querySelectorAll('div'));
                    const cleanDiv = divs.find(d => {
                        const t = d.innerText.trim();
                        return t.length > 10 && !t.includes('$') && !t.includes('Add to Cart');
                    });
                    if (cleanDiv) name = cleanDiv.innerText.trim();
                }

                if (!name) return;

                // Price
                let priceText = '';
                const priceEl = Array.from(el.querySelectorAll('*')).find(e => e.innerText && e.innerText.includes('$'));
                if (priceEl) priceText = priceEl.innerText;

                const priceMatch = priceText ? priceText.match(/\d+[\d,.]*/) : null;
                const price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : null;

                if (!price) return;

                // Image
                // Look for img inside picture or direct img
                const imgEl = el.querySelector('img');
                let img = 'No Image Found';

                if (imgEl) {
                    img = imgEl.currentSrc || imgEl.src || imgEl.getAttribute('srcset')?.split(' ')[0] || imgEl.getAttribute('data-src');
                }

                // Determine Model
                let model = 'Other';
                const lowerName = name.toLowerCase();
                if (lowerName.includes('blade')) model = 'Blade';
                else if (lowerName.includes('clash')) model = 'Clash';
                else if (lowerName.includes('pro staff') || lowerName.includes('rf')) model = 'Pro Staff/RF';
                else if (lowerName.includes('ultra')) model = 'Ultra';
                else if (lowerName.includes('shift')) model = 'Shift';
                else if (lowerName.includes('burn')) model = 'Burn';
                else if (lowerName.includes('junior') || lowerName.includes('jr') || lowerName.includes('minions')) model = 'Junior';

                // Filter duplicates and non-rackets
                if (!seen.has(name) && !lowerName.includes('bag') && !lowerName.includes('shoe')) {
                    seen.add(name);
                    items.push({
                        name,
                        model,
                        price,
                        image: img,
                        url: el.href
                    });
                }
            });
            return items;
        });

        console.log(`✅ Collected ${products.length} unique rackets.`);

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(products, null, 2));
        console.log(`Saved to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

scrapeWilson();
