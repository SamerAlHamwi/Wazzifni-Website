const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Rep = require('../models/Rep');
const { protectSales, restrictTo } = require('../middleware/authMiddleware');
const { JWT_SECRET } = process.env;

const signToken = (id) => {
  return jwt.sign({ id, role: 'rep' }, JWT_SECRET, { expiresIn: '7d' });
};

// Login for reps
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const rep = await Rep.findOne({ username, password });
    if (!rep) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = signToken(rep._id);
    res.json({
      token,
      _id: rep._id,
      username: rep.username,
      fullName: rep.fullName
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protect routes below this point
router.use(protectSales);

// Get all reps
router.get('/', restrictTo('admin', 'superadmin'), async (req, res) => {
  try {
    const reps = await Rep.find().sort({ fullName: 1 });
    res.json(reps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a rep
router.post('/', restrictTo('admin', 'superadmin'), async (req, res) => {
  try {
    const { username, password, fullName } = req.body;
    const rep = new Rep({ username, password, fullName });
    await rep.save();
    res.status(201).json(rep);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update rep password
router.put('/:id/password', restrictTo('admin', 'superadmin'), async (req, res) => {
  try {
    const { password } = req.body;
    const rep = await Rep.findByIdAndUpdate(req.params.id, { password }, { new: true });
    if (!rep) return res.status(404).json({ error: 'Rep not found' });
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a rep (by ID)
router.delete('/:id', restrictTo('admin', 'superadmin'), async (req, res) => {
  try {
    const result = await Rep.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Rep not found' });
    res.json({ message: 'Rep deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;