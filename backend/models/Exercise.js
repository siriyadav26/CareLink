const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, enum: ['seated', 'low-impact', 'stretching', 'balance'] },
  videoUrl: String,
  thumbnail: String,
  duration: String,
  difficulty: { type: String, default: 'Beginner' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Exercise', exerciseSchema);
