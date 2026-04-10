const mongoose = require('mongoose');

const faceEmbeddingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  embedding: { type: [Number], required: true }, // 128D descriptor
  createdAt: { type: Date, default: Date.now },
});

// index for faster lookups
faceEmbeddingSchema.index({ userId: 1 });

module.exports = mongoose.model('FaceEmbedding', faceEmbeddingSchema);
