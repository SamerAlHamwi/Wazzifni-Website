const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Action = require('../models/Action');
const { protectSales, restrictTo } = require('../middleware/authMiddleware');

router.use(protectSales);

// Get all actions
router.get('/', restrictTo('admin', 'superadmin', 'rep'), async (req, res) => {
  try {
    const actions = await Action.find().sort({ name: 1 });
    res.json(actions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add an action
router.post('/', restrictTo('admin', 'superadmin'), async (req, res) => {
  try {
    const { name, points } = req.body;
    const action = new Action({ name, points });
    await action.save();
    res.status(201).json(action);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an action (by ID or name)
router.delete('/:idOrName', restrictTo('admin', 'superadmin'), async (req, res) => {
  try {
    const { idOrName } = req.params;
    let result;

    if (mongoose.Types.ObjectId.isValid(idOrName)) {
      result = await Action.findByIdAndDelete(idOrName);
    }

    if (!result) {
      result = await Action.findOneAndDelete({ name: idOrName });
    }

    if (!result) {
      return res.status(404).json({ error: 'Action not found' });
    }
    res.json({ message: 'Action deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;