const express = require('express');
const router = express.Router();
const Payload = require('../models/Payload.cjs');
const { validatePayload } = require('../middleware/validation.cjs');

// GET /api/payloads - List all payloads
router.get('/', async (req, res, next) => {
    try {
        const payloads = await Payload.find().sort({ createdAt: 1 });
        res.json({
            success: true,
            count: payloads.length,
            data: payloads
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/payloads/:id - Get a single payload by ID
router.get('/:id', async (req, res, next) => {
    try {
        const payload = await Payload.findOne({ id: req.params.id });

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
    } catch (err) {
        next(err);
    }
});

// POST /api/payloads - Create a new payload
router.post('/', validatePayload, async (req, res, next) => {
    try {
        const count = await Payload.countDocuments();
        const newId = req.body.id || `PAY-${String(count + 1).padStart(3, '0')}`;

        const newPayloadData = {
            id: newId,
            name: req.body.name,
            type: req.body.type,
            priority: req.body.priority || 'Normal',
            size: req.body.size,
            status: req.body.status || 'Queued'
        };

        const newPayload = await Payload.create(newPayloadData);

        res.status(201).json({
            success: true,
            message: 'Payload created successfully',
            data: newPayload
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Payload with this ID already exists'
            });
        }
        next(err);
    }
});

// PUT /api/payloads/:id - Update an existing payload
router.put('/:id', validatePayload, async (req, res, next) => {
    try {
        const updateData = {
            ...req.body,
            id: req.params.id
        };

        const payload = await Payload.findOneAndUpdate(
            { id: req.params.id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!payload) {
            return res.status(404).json({
                success: false,
                error: 'Payload not found'
            });
        }

        res.json({
            success: true,
            message: 'Payload updated successfully',
            data: payload
        });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/payloads/:id - Delete a payload
router.delete('/:id', async (req, res, next) => {
    try {
        const payload = await Payload.findOneAndDelete({ id: req.params.id });

        if (!payload) {
            return res.status(404).json({
                success: false,
                error: 'Payload not found'
            });
        }

        res.json({
            success: true,
            message: 'Payload deleted successfully',
            data: payload
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
