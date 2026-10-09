const express = require('express');
const router = express.Router();
const { evaluateMissionRouting, getRoutingHistory } = require('../services/missionRoutingService.cjs');

// GET /api/routing - Get latest mission routing recommendation
router.get('/', async (req, res, next) => {
    try {
        const decision = await evaluateMissionRouting();
        res.json({
            success: true,
            data: decision
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/routing/history - Get routing decision history
router.get('/history', async (req, res, next) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const history = await getRoutingHistory(limit);
        res.json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/routing/evaluate - Force evaluation & persist decision
router.post('/evaluate', async (req, res, next) => {
    try {
        const decision = await evaluateMissionRouting();
        res.status(201).json({
            success: true,
            message: 'Mission routing evaluation executed and persisted',
            data: decision
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
