const MoodEntry = require('../models/MoodEntry');

exports.createMood = async (req, res) => {
  try {
    const mood = new MoodEntry({ ...req.body, userId: req.userId });
    await mood.save();
    res.status(201).json(mood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMoods = async (req, res) => {
  try {
    const moods = await MoodEntry.find({ userId: req.userId }).sort({ date: -1 }).limit(30);
    res.json(moods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};