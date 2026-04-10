const User = require('../models/User');
const Medicine = require('../models/Medicine');
const MoodEntry = require('../models/MoodEntry');
const GameScore = require('../models/GameScore');
const ChatLog = require('../models/ChatLog');
const FallDetectionLog = require('../models/FallDetectionLog');
const CaregiverPatientRelationship = require('../models/CaregiverPatientRelationship');
const openai = require('openai');

// Get all patients for a caregiver
exports.getPatients = async (req, res) => {
  try {
    const relationships = await CaregiverPatientRelationship.find({ 
      caregiverId: req.user.id,
      status: 'active'
    }).populate('patientId', 'name email caretakerPhone');
    
    res.json(relationships.map(r => r.patientId));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get detailed stats for a specific patient
exports.getPatientStats = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Validate relationship
    const relationship = await CaregiverPatientRelationship.findOne({
      caregiverId: req.user.id,
      patientId,
      status: 'active'
    });
    
    if (!relationship) {
      return res.status(403).json({ message: 'Unauthorized access to this patient' });
    }

    const [medicines, moods, games, falls] = await Promise.all([
      Medicine.find({ userId: patientId }),
      MoodEntry.find({ userId: patientId }).sort({ createdAt: -1 }).limit(7),
      GameScore.find({ userId: patientId }).sort({ createdAt: -1 }).limit(10),
      FallDetectionLog.find({ userId: patientId }).sort({ timestamp: -1 }).limit(5)
    ]);

    // Simple chatbot summary logic
    const recentChats = await ChatLog.find({ userId: patientId })
      .sort({ createdAt: -1 })
      .limit(20);
    
    let chatbotSummary = "No recent interactions.";
    if (recentChats.length > 0) {
      // In a real app, we'd call OpenAI here to summarize
      chatbotSummary = `Patient discussed ${new Set(recentChats.map(c => c.query.substring(0, 10))).size} different topics today.`;
    }

    res.json({
      medicines,
      moods,
      games,
      falls,
      chatbotSummary
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a note/message to patient
exports.sendPatientNote = async (req, res) => {
  try {
    const { patientId, message, type } = req.body;
    // Implementation for sending a note (e.g., via push notification or a dedicated Messages model)
    // For now, we'll just log it
    console.log(`Caregiver ${req.user.id} sent ${type} to patient ${patientId}: ${message}`);
    res.json({ message: 'Note sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
