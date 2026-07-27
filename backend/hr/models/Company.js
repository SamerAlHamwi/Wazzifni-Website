const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  sector: String,
  contact: String,
  phone: String,
  addr: String,
  note: String,
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);