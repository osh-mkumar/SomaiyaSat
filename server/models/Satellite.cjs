const mongoose = require('mongoose');

const satelliteSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Satellite name is required'],
        trim: true
    },
    status: {
        type: String,
        default: 'Nominal',
        trim: true
    },
    battery: {
        type: Number,
        required: [true, 'Battery level is required'],
        min: 0,
        max: 100
    },
    signal: {
        type: Number,
        required: [true, 'Signal strength is required'],
        min: 0,
        max: 100
    },
    temp: {
        type: Number,
        required: [true, 'Temperature is required']
    },
    orbit: {
        type: Number,
        required: [true, 'Orbit altitude is required'],
        default: 500
    },
    communication: {
        type: String,
        enum: ['Online', 'Offline'],
        default: 'Online'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Satellite', satelliteSchema);
