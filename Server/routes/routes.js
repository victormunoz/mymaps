const express = require('express');

const AuthController = require('../controllers/AuthController');
const Landmark = require("../models/landmark");

module.exports = function (app) {
    const api = express.Router();

    api.post('/', async (req, res) => {
        try {
            const landmark = new Landmark(req.body);
            await landmark.save();
            res.status(201).json(landmark);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

// Get all landmarks
    api.get('/', async (req, res) => {
        try {
            const landmarks = await Landmark.find().sort({ date: -1 });
            res.json(landmarks);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

// Update a landmark
    api.post('/update/:id', async (req, res) => {
        try {
            const landmark = await Landmark.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(landmark);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    api.post('/delete/:id', async (req, res) => {
        try {
            await Landmark.findByIdAndDelete(req.params.id);
            res.json({ message: 'Landmark deleted' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    api.post('/delete-all', async (req, res) => {
        try {
            await Landmark.deleteMany({});
            res.json({ message: 'Landmarks deleted' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    api.post('/import', async (req, res) => {
        try {
            const landmarksData = req.body;

            // Validate data
            if (!Array.isArray(landmarksData)) {
                return res.status(400).json({ error: 'Invalid data format' });
            }

            // Insert landmarks into the database
            const insertedLandmarks = await Landmark.insertMany(landmarksData);

            res.status(201).json(insertedLandmarks);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Use router
    app.use('/api', api);
};
