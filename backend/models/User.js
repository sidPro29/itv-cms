const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  mobile: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'superAdmin'], default: 'user' },
  activePlans: [{
    planName: String,
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    expiryDate: Date
  }],
  lastDevice: { type: String, enum: ['android', 'ios', 'web', 'tv'], default: 'web' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
