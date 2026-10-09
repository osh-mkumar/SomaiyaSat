const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    frequency: {
        type: mongoose.Schema.Types.Mixed,
        default: 437.5
    },
    bandwidth: {
        type: String,
        default: '12.5kHz'
    },
    activeMode: {
        type: String,
        default: 'M17'
    },
    modes: {
        M17: { type: Boolean, default: true },
        Codec2: { type: Boolean, default: false },
        SSTV: { type: Boolean, default: false }
    },
    transmitPower: {
        type: Number,
        default: 75,
        min: 0,
        max: 100
    },
    downtime: {
        hours: { type: Number, default: 0, min: 0 },
        minutes: { type: Number, default: 15, min: 0, max: 59 },
        seconds: { type: Number, default: 0, min: 0, max: 59 }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Config', configSchema);
