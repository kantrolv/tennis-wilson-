// Vercel Serverless Function - wraps the Express backend
// This file is called for all /api/* routes on tennis-wilson.vercel.app
// It imports the Express app from the server/ directory (relative path)

const path = require('path');

// When running locally for testing, load .env from server directory
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: path.join(__dirname, '../../server/.env') });
}

// Import the Express app (server/index.js exports the app without starting a port listener)
const app = require('../../server/index');

module.exports = app;
