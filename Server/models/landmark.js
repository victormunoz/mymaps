const mongoose = require('mongoose');

const LandmarkSchema = new mongoose.Schema({
    place: String,
    country: String,
    date: Date,
    year: Number,
    tags: [String],
    coordinates: {
        lat: Number,
        lng: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Landmark', LandmarkSchema);
