const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const Product = require('./models/Product');
    const region = undefined;
    let query = { category: 'racket', sport: 'tennis' };

    if (region) {
        query.$or = [
            { addedByRegion: 'global' },
            { addedByRegion: region },
            { addedByRegion: { $exists: false } }
        ];
    } else {
        query.$or = [
            { addedByRegion: 'global' },
            { addedByRegion: { $exists: false } }
        ];
    }

    console.log("Query object:", JSON.stringify(query));
    const rackets = await Product.find(query);
    console.log("Count:", rackets.length);
    process.exit(0);
  })
  .catch(err => {
    console.error("error:", err);
    process.exit(1);
  });
