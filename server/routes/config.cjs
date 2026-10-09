const express = require('express');
const router = express.Router();
const Config = require('../models/Config.cjs');
const { validateConfig } = require('../middleware/validation.cjs');

// GET /api/config - Get current RF configuration
router.get('/', async (req, res, next) => {
    try {
        let config = await Config.findOne().sort({ updatedAt: -1 });
        if (!config) {
            // Create default config document if none exists
            config = await Config.create({
                frequency: 437.5,
                bandwidth: '12.5kHz',
                activeMode: 'M17',
                modes: { M17: true, Codec2: false, SSTV: false },
                transmitPower: 75,
                downtime: { hours: 0, minutes: 15, seconds: 0 }
            });
        }

        res.json({
            success: true,
            data: config
        });
    } catch (err) {
        next(err);
    }
});

// PUT /api/config - Update RF configuration
router.put('/', validateConfig, async (req, res, next) => {
    try {
        let config = await Config.findOne().sort({ updatedAt: -1 });

        if (!config) {
            config = await Config.create(req.body);
        } else {
            Object.assign(config, req.body);
            await config.save();
        }

        res.json({
            success: true,
            message: 'RF configuration updated successfully',
            data: config
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
