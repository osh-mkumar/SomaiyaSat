const express = require('express');
const router = express.Router();
const { readDatabase, writeDatabase } = require('../utils/database.cjs');
const { validatePayload } = require('../middleware/validation.cjs');

// GET /api/payloads - List all payloads
router.get('/', (req, res) => {
    const db = readDatabase();
    res.json({
        success: true,
        count: db.payloads.length,
        data: db.payloads
    });
});

// GET /api/payloads/:id - Get a single payload by ID
router.get('/:id', (req, res) => {
    const db = readDatabase();
    const payload = db.payloads.find(p => p.id === req.params.id);

    if (!payload) {
        return res.status(404).json({
            success: false,
            error: 'Payload not found'
        });
    }

    res.json({
        success: true,
        data: payload
    });
});

// POST /api/payloads - Create a new payload
router.post('/', validatePayload, (req, res) => {
    const db = readDatabase();
    const newId = req.body.id || `PAY-${String(db.payloads.length + 1).padStart(3, '0')}`;

    const newPayload = {
        id: newId,
        name: req.body.name,
        type: req.body.type,
        priority: req.body.priority || 'Normal',
        size: req.body.size,
        status: req.body.status || 'Queued'
    };

    db.payloads.push(newPayload);
    writeDatabase(db);

    res.status(201).json({
        success: true,
        message: 'Payload created successfully',
        data: newPayload
    });
});

// PUT /api/payloads/:id - Update an existing payload
router.put('/:id', validatePayload, (req, res) => {
    const db = readDatabase();
    const index = db.payloads.findIndex(p => p.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({
            success: false,
            error: 'Payload not found'
        });
    }

    db.payloads[index] = {
        ...db.payloads[index],
        ...req.body,
        id: req.params.id
    };

    writeDatabase(db);

    res.json({
        success: true,
        message: 'Payload updated successfully',
        data: db.payloads[index]
    });
});

// DELETE /api/payloads/:id - Delete a payload
router.delete('/:id', (req, res) => {
    const db = readDatabase();
    const index = db.payloads.findIndex(p => p.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({
            success: false,
            error: 'Payload not found'
        });
    }

    const deleted = db.payloads.splice(index, 1)[0];
    writeDatabase(db);

    res.json({
        success: true,
        message: 'Payload deleted successfully',
        data: deleted
    });
});

module.exports = router;
