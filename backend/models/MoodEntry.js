const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MoodEntry', moodEntrySchema);