const mongoose = require('mongoose');

const fallDetectionLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['detected', 'alerted', 'canceled'], default: 'detected' },
  location: {
    lat: Number,
    lng: Number
  },
  details: String
});

module.exports = mongoose.model('FallDetectionLog', fallDetectionLogSchema);
