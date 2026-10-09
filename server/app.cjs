require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getIsConnected } = require('./config/db.cjs');

const satellitesRouter = require('./routes/satellites.cjs');
const payloadsRouter = require('./routes/payloads.cjs');
const passesRouter = require('./routes/passes.cjs');
const configRouter = require('./routes/config.cjs');
const routingRouter = require('./routes/routing.cjs');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler.cjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB().catch(err => {
    console.error('Initial MongoDB Connection Failed:', err.message);
    console.warn('Backend server running, but MongoDB operations will fail until MongoDB is accessible.');
});

// Middleware
app.use(cors());
app.use(express.json());

// Modular Routes
app.use('/api/satellites', satellitesRouter);
app.use('/api/payloads', payloadsRouter);
app.use('/api/passes', passesRouter);
app.use('/api/config', configRouter);
app.use('/api/routing', routingRouter);

// Root Route & System Health
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'SomaiyaSat Express API is running',
        database: {
            connected: getIsConnected(),
            provider: 'MongoDB with Mongoose'
        }
    });
});

// 404 Handler
app.use(notFoundHandler);

// Error Handler Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
    console.log(`SomaiyaSat Express API running on port ${PORT}`);
});
