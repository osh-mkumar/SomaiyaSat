const express = require('express');
const router = express.Router();
const Satellite = require('../models/Satellite.cjs');
const { validateSatellite } = require('../middleware/validation.cjs');

// GET /api/satellites - List all satellites
router.get('/', async (req, res, next) => {
    try {
        const satellites = await Satellite.find().sort({ createdAt: 1 });
        res.json({
            success: true,
            count: satellites.length,
            data: satellites
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/satellites/:id - Get a single satellite by ID
router.get('/:id', async (req, res, next) => {
    try {
        const satellite = await Satellite.findOne({ id: req.params.id });

        if (!satellite) {
            return res.status(404).json({
                success: false,
                error: 'Satellite not found'
            });
        }

        res.json({
            success: true,
            data: satellite
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/satellites - Create a new satellite
router.post('/', validateSatellite, async (req, res, next) => {
    try {
        const count = await Satellite.countDocuments();
        const newId = req.body.id || `SAT-${String(count + 1).padStart(3, '0')}`;
        
        const satelliteData = {
            id: newId,
            name: req.body.name,
            status: req.body.status || 'Nominal',
            battery: Number(req.body.battery),
            signal: Number(req.body.signal),
            temp: Number(req.body.temp !== undefined ? req.body.temp : req.body.temperature),
            orbit: Number(req.body.orbit !== undefined ? req.body.orbit : req.body.altitude || 500),
            communication: req.body.communication || 'Online'
        };

        const newSatellite = await Satellite.create(satelliteData);

        res.status(201).json({
            success: true,
            message: 'Satellite created successfully',
            data: newSatellite
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Satellite with this ID already exists'
            });
        }
        next(err);
    }
});

// PUT /api/satellites/:id - Update an existing satellite
router.put('/:id', validateSatellite, async (req, res, next) => {
    try {
        const updateData = {
            ...req.body,
            id: req.params.id // ensure ID is preserved
        };

        if (req.body.temp !== undefined || req.body.temperature !== undefined) {
            updateData.temp = Number(req.body.temp !== undefined ? req.body.temp : req.body.temperature);
        }
        if (req.body.orbit !== undefined || req.body.altitude !== undefined) {
            updateData.orbit = Number(req.body.orbit !== undefined ? req.body.orbit : req.body.altitude);
        }

        const satellite = await Satellite.findOneAndUpdate(
            { id: req.params.id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!satellite) {
            return res.status(404).json({
                success: false,
                error: 'Satellite not found'
            });
        }

        res.json({
            success: true,
            message: 'Satellite updated successfully',
            data: satellite
        });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/satellites/:id - Delete a satellite
router.delete('/:id', async (req, res, next) => {
    try {
        const satellite = await Satellite.findOneAndDelete({ id: req.params.id });

        if (!satellite) {
            return res.status(404).json({
                success: false,
                error: 'Satellite not found'
            });
        }

        res.json({
            success: true,
            message: 'Satellite deleted successfully',
            data: satellite
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
