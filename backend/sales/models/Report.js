const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  rep_name: {
    type: String,
    required: true
  },
  company_name: {
    type: String,
    required: true
  },
  company_phone: String,
  company_email: String,
  company_address: String,
  company_gps: String,
  actions: [String],
  total_points: {
    type: Number,
    default: 0
  },
  notes: String,
  date: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', reportSchema);