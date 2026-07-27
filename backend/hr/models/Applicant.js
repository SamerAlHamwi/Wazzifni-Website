const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: String,
  address: String,
  job: String,
  company: String, // company name (denormalized)
  idate: Date, // interview date
  send: { type: String, enum: ['تم الإرسال', 'لم يتم الإرسال', ''] },
  status: { type: String, enum: ['مقبول', 'مرفوض', 'قيد المراجعة', ''] },
  deduct: { type: Number, default: 0 },
  sdate: Date, // start date
  notes: String,
  scorecard: {
    fit: { type: Number, default: 0 },
    tech: { type: Number, default: 0 },
    comm: { type: Number, default: 0 },
    salary: { type: Number, default: 0 },
    risk: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    decision: { type: String, enum: ['send', 'keep', 'reject', ''], default: '' },
    recruiterNotes: String,
    recruiterName: String,
    recruiterDate: Date,
  }
}, { timestamps: true });

module.exports = mongoose.model('Applicant', applicantSchema);