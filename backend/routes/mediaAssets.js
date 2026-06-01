const express = require('express');
const router = express.Router();
const MediaAsset = require('../models/MediaAsset');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get all media assets
router.get('/', async (req, res) => {
  try {
    const assets = await MediaAsset.find().sort({ createdAt: -1 });
    res.json(assets);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create media asset (Admin only)
router.post('/', [auth, admin], async (req, res) => {
  try {
    const newAsset = new MediaAsset(req.body);
    const asset = await newAsset.save();
    res.json(asset);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete media asset (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const asset = await MediaAsset.findById(req.params.id);
    if (!asset) return res.status(404).json({ msg: 'Media Asset not found' });
    await asset.deleteOne();
    res.json({ msg: 'Media Asset removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update media asset (Admin only)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const asset = await MediaAsset.findById(req.params.id);
    if (!asset) return res.status(404).json({ msg: 'Media Asset not found' });
    const updated = await MediaAsset.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
