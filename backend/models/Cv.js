const mongoose = require('mongoose');

const cvSchema = new mongoose.Schema({
  clientId: { type: String, required: true, index: true },
  language: { type: String, default: 'ar' },
  name: { type: String, default: '' },
  title: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  city: { type: String, default: '' },
  template: { type: String, default: 'bold' },
  pages: { type: Number, default: 1 },
  photo: { type: String, default: null },
  cvData: { type: Object, default: {} },
  pdfFile: {
    data: Buffer,
    contentType: { type: String, default: 'application/pdf' },
    size: Number
  },
  pdfUrl: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cv', cvSchema);
