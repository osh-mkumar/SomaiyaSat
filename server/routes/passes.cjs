const express = require('express');
const router = express.Router();
const { readDatabase, writeDatabase } = require('../utils/database.cjs');
const { validatePass } = require('../middleware/validation.cjs');

// GET /api/passes - List all scheduled passes
router.get('/', (req, res) => {
    const db = readDatabase();
    res.json({
        success: true,
        count: db.passes.length,
        data: db.passes
    });
});

// GET /api/passes/:id - Get a single pass by ID
router.get('/:id', (req, res) => {
    const db = readDatabase();
    const pass = db.passes.find(p => p.id === req.params.id);

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
});

// POST /api/passes - Schedule a new pass
router.post('/', validatePass, (req, res) => {
    const db = readDatabase();
    const newId = req.body.id || `PASS-${Date.now().toString().slice(-4)}`;

    const lat = Number(req.body.latitude);
    const lon = Number(req.body.longitude);
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    const locationStr = req.body.location || `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;

    const newPass = {
        id: newId,
        satellite: req.body.satellite,
        latitude: lat,
        longitude: lon,
        location: locationStr,
        scheduledTime: req.body.scheduledTime || req.body.time,
        time: req.body.time || req.body.scheduledTime,
        date: req.body.date || new Date().toISOString().split('T')[0],
        status: req.body.status || 'Scheduled',
        createdAt: req.body.createdAt || new Date().toISOString()
    };

    db.passes.push(newPass);
    writeDatabase(db);

    res.status(201).json({
        success: true,
        message: 'Pass scheduled successfully',
        data: newPass
    });
});

// PUT /api/passes/:id - Update an existing scheduled pass
router.put('/:id', validatePass, (req, res) => {
    const db = readDatabase();
    const index = db.passes.findIndex(p => p.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({
            success: false,
            error: 'Pass not found'
        });
    }

    db.passes[index] = {
        ...db.passes[index],
        ...req.body,
        id: req.params.id
    };

    writeDatabase(db);

    res.json({
        success: true,
        message: 'Pass updated successfully',
        data: db.passes[index]
    });
});

// DELETE /api/passes/:id - Delete/cancel a scheduled pass
router.delete('/:id', (req, res) => {
    const db = readDatabase();
    const index = db.passes.findIndex(p => p.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({
            success: false,
            error: 'Pass not found'
        });
    }

    const deleted = db.passes.splice(index, 1)[0];
    writeDatabase(db);

    res.json({
        success: true,
        message: 'Pass deleted successfully',
        data: deleted
    });
});

module.exports = router;
