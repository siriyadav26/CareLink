const mongoose = require('mongoose');

const relationshipSchema = new mongoose.Schema({
  caregiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'active', 'terminated'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CaregiverPatientRelationship', relationshipSchema);
