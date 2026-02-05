const express = require('express');
const router = express.Router();
const {
    getRackets,
    getRacketById,
    createRacket,
    seedRackets
} = require('../controllers/rackets.controller');

// Note: In a full production app, createRacket and seedRackets would use 'protect' and 'admin' middleware
// For this demo, we'll keep them public or assume admin status for testing purposes if middleware is not ready.

router.route('/')
    .get(getRackets)
    .post(createRacket);

router.post('/seed', seedRackets);

router.route('/:id')
    .get(getRacketById);

module.exports = router;
