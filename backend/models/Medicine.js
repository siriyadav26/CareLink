const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  time: { type: String, required: true },
  days: [{ type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }],
  takenToday: { type: Boolean, default: false },
  lastTakenDate: { type: Date },
  alertSentForToday: { type: Boolean, default: false }, // Prevent duplicate emails
  lastDoseConfirmedAt: { type: Date }, // Track exact time user clicked "Taken"
  stock: { type: Number, default: 0 },
  refillThreshold: { type: Number, default: 5 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Medicine', medicineSchema);