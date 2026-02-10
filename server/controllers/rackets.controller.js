const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// @desc    Fetch all tennis rackets
// @route   GET /api/rackets
// @access  Public
// @desc    Fetch all tennis rackets with advanced filtering
// @route   GET /api/rackets
// @access  Public
const getRackets = asyncHandler(async (req, res) => {
    const { series, minPrice, maxPrice, ageGroup } = req.query;

    let query = { category: 'racket', sport: 'tennis' };

    // Series Filter (Multiple selection support)
    if (series) {
        const seriesList = series.split(',');
        query.model = { $in: seriesList };
    }

    // Price Filter
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Age Group Filter (Adult / Junior)
    if (ageGroup) {
        // Map frontend "Kids" to backend "Junior" if needed, or keep consistent
        const targetGroup = ageGroup.toLowerCase() === 'kids' ? 'Junior' : ageGroup;
        // Capitalize first letter to match Enum
        query.ageGroup = targetGroup.charAt(0).toUpperCase() + targetGroup.slice(1).toLowerCase();
    }

    const rackets = await Product.find(query);
    res.json(rackets);
});

// @desc    Fetch single racket
// @route   GET /api/rackets/:id
// @access  Public
const getRacketById = asyncHandler(async (req, res) => {
    const racket = await Product.findById(req.params.id);

    if (racket) {
        res.json(racket);
    } else {
        res.status(404);
        throw new Error('Racket not found');
    }
});

// @desc    Add racket (admin only)
// @route   POST /api/rackets
// @access  Private/Admin
const createRacket = asyncHandler(async (req, res) => {
    const {
        name, brand, model, price, category, ageGroup, sport, weight,
        balance, material, gripStock, description, imageUrl, stock
    } = req.body;

    const productExists = await Product.findOne({ name });

    if (productExists) {
        res.status(400);
        throw new Error('Product with this name already exists');
    }

    const racket = new Product({
        name, brand, model, price, category, ageGroup, sport, weight,
        balance, material, gripStock, description, imageUrl, stock
    });

    const createdRacket = await racket.save();
    res.status(201).json(createdRacket);
});

// @desc    Seed rackets from wilson_package.json
// @route   POST /api/rackets/seed
// @access  Private/Admin
const seedRackets = asyncHandler(async (req, res) => {
    try {
        // 1. Clear existing data
        await Product.deleteMany({});
        console.log("Cleared existing products.");

        // 2. Load seeded data
        const scraperPath = path.join(__dirname, '../data/wilson_package_enriched.json');

        if (!fs.existsSync(scraperPath)) {
            res.status(404);
            throw new Error(`Data file not found at ${scraperPath}`);
        }

        const scraperContent = fs.readFileSync(scraperPath, 'utf-8');
        const rawScraperData = JSON.parse(scraperContent);
        console.log(`Loaded ${rawScraperData.length} items from data file.`);

        // 3. Map dta to schema
        const racketsToInsert = rawScraperData.map(item => {
            // Determine model
            let model = item.model;
            // Infer model if missing or generic
            if (!model || model === "Other" || model === "Wilson") {
                if (item.name.includes("Ultra")) model = "Ultra";
                else if (item.name.includes("Blade")) model = "Blade";
                else if (item.name.includes("Clash")) model = "Clash";
                else if (item.name.includes("Pro Staff") || item.name.includes("RF")) model = "Pro Staff/RF";
                else if (item.name.includes("Shift")) model = "Shift";
                else if (item.name.includes("Burn")) model = "Burn";
                else model = "Other";
            }

            // Determine Age Group
            let ageGroup = 'Adult';
            const lowerName = item.name.toLowerCase();
            if (lowerName.includes('jr') || lowerName.includes('junior') ||
                lowerName.match(/\s2[1356]\s/) || lowerName.includes(' 19 ') || lowerName.includes(' 17 ')) {
                ageGroup = 'Junior';
            }

            return {
                name: item.name,
                brand: "Wilson",
                model: model,
                price: item.price,
                category: "racket",
                ageGroup: ageGroup,
                sport: "tennis",
                weight: 300, // Default
                balance: "32cm / 7 pts HL", // Default
                material: "Graphite Composite", // Default
                gripStock: { "4 1/4\" (2)": 10, "4 3/8\" (3)": 10 }, // Default stock
                description: `Official Wilson ${item.name}. High performance tennis racket designed for players looking to elevate their game.`,
                imageUrl: (item.imageUrl && item.imageUrl !== "No Image Found") ? item.imageUrl : "https://www.wilson.com/en-us/explore/tennis/rackets/clash-v2",
                stock: 10,
                source: "scraper"
            };
        });

        console.log("First item imageUrl:", racketsToInsert[0].imageUrl);
        console.log("First raw item:", rawScraperData[0]);

        // 4. Insert data
        const seededRackets = await Product.insertMany(racketsToInsert);

        res.status(201).json({
            message: `Database cleared and ${seededRackets.length} rackets seeded from scraper successfully`,
            seeded: seededRackets
        });
    } catch (error) {
        console.error(error);
        res.status(500);
        throw new Error(`Seeding failed: ${error.message}`);
    }
});

module.exports = {
    getRackets,
    getRacketById,
    createRacket,
    seedRackets
};
