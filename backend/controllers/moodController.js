const MoodEntry = require('../models/MoodEntry');

exports.createMood = async (req, res) => {
  try {
    const { mood, dayString } = req.body;

    if (!dayString) {
      return res.status(400).json({ message: 'Day string is required' });
    }

    const existingMood = await MoodEntry.findOne({
      userId: req.userId,
      dayString: dayString,
    });

    if (existingMood) {
      return res.status(400).json({ message: 'Mood already submitted today. Please come back tomorrow!' });
    }

    const newMood = new MoodEntry({
      mood,
      dayString,
      userId: req.userId,
    });
    await newMood.save();
    res.status(201).json(newMood);
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

exports.resetTodayMood = async (req, res) => {
  try {
    const { dayString } = req.body;
    await MoodEntry.deleteMany({ userId: req.userId, dayString: dayString });
    res.json({ message: 'Today\'s mood has been reset for demo' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};