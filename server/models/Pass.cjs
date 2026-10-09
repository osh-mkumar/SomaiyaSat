const mongoose = require('mongoose');

const passSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },
    satellite: {
        type: String,
        required: [true, 'Satellite name is required'],
        trim: true
    },
    latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: -90,
        max: 90
    },
    longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: -180,
        max: 180
    },
    location: {
        type: String,
        trim: true
    },
    scheduledTime: {
        type: String,
        required: [true, 'Scheduled time is required'],
        trim: true
    },
    time: {
        type: String,
        trim: true
    },
    date: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Pass', passSchema);
