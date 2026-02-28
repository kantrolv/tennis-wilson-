const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const Product = require('./models/Product');
    const query = {
      category: 'racket',
      sport: 'tennis',
      $or: [
        { addedByRegion: 'global' },
        { addedByRegion: { $exists: false } }
      ]
    };
    const items = await Product.find(query).limit(5);
    console.log(items.length);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
