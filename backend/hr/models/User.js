const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  title: String,
  active: { type: Boolean, default: true },
  color: { type: String, default: '#0077b6' },
  perms: {
    add: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    del: { type: Boolean, default: false },
    pay: { type: Boolean, default: false },
    rep: { type: Boolean, default: false },
    adm: { type: Boolean, default: false },
  },
  role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);