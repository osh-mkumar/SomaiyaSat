const express = require('express');
const router = express.Router();
const Pass = require('../models/Pass.cjs');
const { validatePass } = require('../middleware/validation.cjs');

// GET /api/passes - List all scheduled passes
router.get('/', async (req, res, next) => {
    try {
        const passes = await Pass.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            count: passes.length,
            data: passes
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/passes/:id - Get a single pass by ID
router.get('/:id', async (req, res, next) => {
    try {
        const pass = await Pass.findOne({ id: req.params.id });

        if (!pass) {
            return res.status(404).json({
                success: false,
                error: 'Pass not found'
            });
        }

        res.json({
            success: true,
            data: pass
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/passes - Schedule a new pass
router.post('/', validatePass, async (req, res, next) => {
    try {
        const newId = req.body.id || `PASS-${Date.now().toString().slice(-4)}`;

        const lat = Number(req.body.latitude);
        const lon = Number(req.body.longitude);
        const latDir = lat >= 0 ? 'N' : 'S';
        const lonDir = lon >= 0 ? 'E' : 'W';
        const locationStr = req.body.location || `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;

        const passData = {
            id: newId,
            satellite: req.body.satellite,
            latitude: lat,
            longitude: lon,
            location: locationStr,
            scheduledTime: req.body.scheduledTime || req.body.time,
            time: req.body.time || req.body.scheduledTime,
            date: req.body.date || new Date().toISOString().split('T')[0],
            status: req.body.status || 'Scheduled',
            createdAt: req.body.createdAt ? new Date(req.body.createdAt) : new Date()
        };

        const newPass = await Pass.create(passData);

        res.status(201).json({
            success: true,
            message: 'Pass scheduled successfully',
            data: newPass
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Pass with this ID already exists'
            });
        }
        next(err);
    }
});

// PUT /api/passes/:id - Update an existing scheduled pass
router.put('/:id', validatePass, async (req, res, next) => {
    try {
        const updateData = {
            ...req.body,
            id: req.params.id
        };

        const pass = await Pass.findOneAndUpdate(
            { id: req.params.id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!pass) {
            return res.status(404).json({
                success: false,
                error: 'Pass not found'
            });
        }

        res.json({
            success: true,
            message: 'Pass updated successfully',
            data: pass
        });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/passes/:id - Delete/cancel a scheduled pass
router.delete('/:id', async (req, res, next) => {
    try {
        const pass = await Pass.findOneAndDelete({ id: req.params.id });

        if (!pass) {
            return res.status(404).json({
                success: false,
                error: 'Pass not found'
            });
        }

        res.json({
            success: true,
            message: 'Pass deleted successfully',
            data: pass
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
