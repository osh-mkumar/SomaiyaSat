const express = require('express');
const router = express.Router();
const { readDatabase, writeDatabase } = require('../utils/database.cjs');
const { validateSatellite } = require('../middleware/validation.cjs');

// GET /api/satellites - List all satellites
router.get('/', (req, res) => {
    const db = readDatabase();
    res.json({
        success: true,
        count: db.satellites.length,
        data: db.satellites
    });
});

// GET /api/satellites/:id - Get a single satellite by ID
router.get('/:id', (req, res) => {
    const db = readDatabase();
    const satellite = db.satellites.find(s => s.id === req.params.id);

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
});

// POST /api/satellites - Create a new satellite
router.post('/', validateSatellite, (req, res) => {
    const db = readDatabase();
    const newId = req.body.id || `SAT-${String(db.satellites.length + 1).padStart(3, '0')}`;
    
    const newSatellite = {
        id: newId,
        name: req.body.name,
        status: req.body.status || 'Nominal',
        battery: Number(req.body.battery),
        signal: Number(req.body.signal),
        temp: Number(req.body.temp !== undefined ? req.body.temp : req.body.temperature),
        orbit: Number(req.body.orbit !== undefined ? req.body.orbit : req.body.altitude || 500),
        communication: req.body.communication || 'Online'
    };

    db.satellites.push(newSatellite);
    writeDatabase(db);

    res.status(201).json({
        success: true,
        message: 'Satellite created successfully',
        data: newSatellite
    });
});

// PUT /api/satellites/:id - Update an existing satellite
router.put('/:id', validateSatellite, (req, res) => {
    const db = readDatabase();
    const index = db.satellites.findIndex(s => s.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({
            success: false,
            error: 'Satellite not found'
        });
    }

    db.satellites[index] = {
        ...db.satellites[index],
        ...req.body,
        id: req.params.id // ensure ID is preserved
    };

    writeDatabase(db);

    res.json({
        success: true,
        message: 'Satellite updated successfully',
        data: db.satellites[index]
    });
});

// DELETE /api/satellites/:id - Delete a satellite
router.delete('/:id', (req, res) => {
    const db = readDatabase();
    const index = db.satellites.findIndex(s => s.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({
            success: false,
            error: 'Satellite not found'
        });
    }

    const deleted = db.satellites.splice(index, 1)[0];
    writeDatabase(db);

    res.json({
        success: true,
        message: 'Satellite deleted successfully',
        data: deleted
    });
});

module.exports = router;
