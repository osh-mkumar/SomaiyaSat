const express = require('express');
const router = express.Router();
const { readDatabase, writeDatabase } = require('../utils/database.cjs');
const { validateConfig } = require('../middleware/validation.cjs');

// GET /api/config - Get current RF configuration
router.get('/', (req, res) => {
    const db = readDatabase();
    res.json({
        success: true,
        data: db.config || {}
    });
});

// PUT /api/config - Update RF configuration
router.put('/', validateConfig, (req, res) => {
    const db = readDatabase();
    
    db.config = {
        ...db.config,
        ...req.body
    };

    writeDatabase(db);

    res.json({
        success: true,
        message: 'RF configuration updated successfully',
        data: db.config
    });
});

module.exports = router;
