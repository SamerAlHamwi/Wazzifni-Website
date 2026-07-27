const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  empId: { type: mongoose.Schema.Types.ObjectId, ref: 'Applicant', required: true },
  empName: String,
  job: String,
  company: String,
  amount: { type: Number, required: true },
  month: String, // YYYY-MM
  pdate: Date, // payment date
  status: { type: String, enum: ['مدفوع', 'متأخر', 'قريب'], default: 'مدفوع' },
  note: String,
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);