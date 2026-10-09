const mongoose = require('mongoose');

const payloadSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Payload name is required'],
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Payload type is required'],
        trim: true
    },
    priority: {
        type: String,
        enum: ['Critical', 'High', 'Normal', 'Low'],
        default: 'Normal'
    },
    size: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Payload size is required']
    },
    status: {
        type: String,
        enum: ['Queued', 'Transmitting', 'Suspended', 'Completed', 'Failed'],
        default: 'Queued'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payload', payloadSchema);
