const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// @desc    Fetch all tennis rackets
// @route   GET /api/rackets
// @access  Public
const getRackets = asyncHandler(async (req, res) => {
    const rackets = await Product.find({ category: 'racket', sport: 'tennis' });
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
        name, brand, model, price, category, sport, weight,
        balance, material, gripSize, description, imageUrl, stock
    } = req.body;

    const productExists = await Product.findOne({ name });

    if (productExists) {
        res.status(400);
        throw new Error('Product with this name already exists');
    }

    const racket = new Product({
        name, brand, model, price, category, sport, weight,
        balance, material, gripSize, description, imageUrl, stock
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

        // 2. Load scraper data (bulk)
        const scraperPath = path.join(__dirname, '../../scraper/wilson-rackets.json');

        if (!fs.existsSync(scraperPath)) {
            res.status(404);
            throw new Error(`Scraper file not found at ${scraperPath}`);
        }

        const scraperContent = fs.readFileSync(scraperPath, 'utf-8');
        const rawScraperData = JSON.parse(scraperContent);
        console.log(`Loaded ${rawScraperData.length} items from scraper.`);

        // 3. Map scraper data to schema
        const racketsToInsert = rawScraperData.map(item => {
            // Determine model
            let model = item.model;
            if (!model || model === "Other") {
                if (item.name.includes("Ulra")) model = "Ultra";
                else if (item.name.includes("Blade")) model = "Blade";
                else if (item.name.includes("Clash")) model = "Clash";
                else if (item.name.includes("Pro Staff")) model = "Pro Staff";
                else if (item.name.includes("Shift")) model = "Shift";
                else if (item.name.includes("Burn")) model = "Burn";
                else model = "Wilson";
            }

            return {
                name: item.name,
                brand: "Wilson",
                model: model,
                price: item.price,
                category: "racket",
                sport: "tennis",
                weight: 300, // Default
                balance: "32cm / 7 pts HL", // Default
                material: "Graphite Composite", // Default
                gripSize: "4 1/4", // Default
                description: `Official Wilson ${item.name}. High performance tennis racket designed for players looking to elevate their game.`,
                imageUrl: (item.image && item.image !== "No Image Found") ? item.image : "https://www.wilson.com/en-us/explore/tennis/rackets/clash-v2",
                stock: 10,
                source: "scraper"
            };
        });

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
