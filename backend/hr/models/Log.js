const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action: String,
  desc: String,
  icon: String,
  user: String,
  time: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Log', logSchema);