const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Set allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173',          // Local Vite dev server
  process.env.FRONTEND_URL          // Replace with live Vercel URL in your .env
];

// Configure CORS for production
const corsOptions = {
    origin: function (origin, callback) {
        // allowing 'undefined' origins (e.g. from postman or curl) requires more care in actual production
        // here we check if origin is in our allowed array or if it doesn't exist (helpful during dev)
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies/headers if you use them
    optionsSuccessStatus: 204
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const racketRoutes = require('./routes/rackets.routes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const adminRoutes = require('./routes/admin');
const superadminRoutes = require('./routes/superadmin');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/rackets', racketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superadminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
