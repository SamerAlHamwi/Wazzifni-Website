const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Action', actionSchema);