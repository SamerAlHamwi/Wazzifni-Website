const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { protectSales, restrictTo } = require('../middleware/authMiddleware');

router.use(protectSales);

// Get all reports
router.get('/', restrictTo('admin', 'superadmin', 'rep'), async (req, res) => {
  try {
    const reports = await Report.find().sort({ created_at: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single report
router.get('/:id', restrictTo('admin', 'superadmin', 'rep'), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create report
router.post('/', restrictTo('admin', 'superadmin', 'rep'), async (req, res) => {
  try {
    const report = new Report(req.body);
    // Enforce that a rep can only submit for themselves
    if (req.user.role === 'rep') {
        report.rep_id = req.user._id;
        report.rep_name = req.user.fullName;
    }
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update report
router.put('/:id', restrictTo('admin', 'superadmin'), async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete report
router.delete('/:id', restrictTo('admin', 'superadmin'), async (req, res) => {
  try {
    const result = await Report.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear all reports
router.delete('/', restrictTo('admin', 'superadmin'), async (req, res) => {
  try {
    await Report.deleteMany({});
    res.json({ message: 'All reports cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;