const mongoose = require('mongoose');

const routingDecisionSchema = new mongoose.Schema({
    selectedPayload: {
        type: String,
        required: true,
        trim: true
    },
    payloadType: {
        type: String,
        trim: true
    },
    priority: {
        type: String,
        trim: true
    },
    confidence: {
        type: Number,
        default: 94.2
    },
    reason: {
        type: String,
        required: true
    },
    constraints: {
        battery: Number,
        signal: Number,
        passRemainingMinutes: Number,
        payloadPriority: String
    },
    decisionQueue: [
        {
            payloadId: String,
            name: String,
            type: String,
            priority: String,
            size: String,
            status: String,
            estTime: String
        }
    ],
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('RoutingDecision', routingDecisionSchema);
