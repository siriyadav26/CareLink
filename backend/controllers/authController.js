const User = require('../models/User');
const FaceEmbedding = require('../models/FaceEmbedding');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService');
const { cosineSimilarity } = require('../utils/matchingUtils');
const path = require('path');
const fs = require('fs');

// AI Dependencies
const tf = require('@tensorflow/tfjs');
const faceapi = require('face-api.js');
const Jimp = require('jimp');

// Global Cache for embeddings
let embeddingCache = [];

// Populate Cache from DB
const populateCache = async () => {
  try {
    const embeddings = await FaceEmbedding.find().populate('userId', 'name email role');
    embeddingCache = embeddings.map(e => ({
      userId: e.userId._id,
      userData: e.userId,
      embedding: e.embedding
    }));
    console.log(`✅ Embedding Cache Synced: ${embeddingCache.length} samples loaded.`);
  } catch (err) {
    console.error('❌ Failed to populate embedding cache:', err);
  }
};

// Initial sync
populateCache();

// Initializing face-api.js for Node.js (Stable Version)
const loadModels = async () => {
  const modelPath = path.join(__dirname, '../faceModels');
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  console.log('🤖 AI Facial Models Loaded Successfully');
};
loadModels().catch(err => console.error('❌ Failed to load AI models:', err));

// Helper: Convert Base64 Image to Tensor (Pure JS - No Canvas Required)
const getDescriptorFromImage = async (base64String) => {
    try {
        const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const image = await Jimp.read(buffer);
        const { width, height, data } = image.bitmap;

        // Convert Jimp buffer to Float32Array for TFJS
        const numChannels = 3;
        const numPixels = width * height;
        const values = new Float32Array(numPixels * numChannels);

        for (let i = 0; i < numPixels; i++) {
            for (let channel = 0; channel < numChannels; channel++) {
                values[i * numChannels + channel] = data[i * 4 + channel] / 255;
            }
        }

        const input = tf.tensor3d(values, [height, width, numChannels], 'float32');
        
        // Detect Face and Extract Descriptor
        const result = await faceapi
            .detectSingleFace(input)
            .withFaceLandmarks()
            .withFaceDescriptor();
        
        input.dispose(); // Cleanup memory

        if (!result) return null;
        return Array.from(result.descriptor);
    } catch (err) {
        console.error('AI Processing Error:', err);
        return null;
    }
};

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ================= REGISTER =================
const register = async (req, res) => {
  try {
    const { name, email, password, role, emergencyEmails } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      role,
      emergencyEmails: emergencyEmails || []
    });

    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name,
        email,
        role,
        emergencyEmails: user.emergencyEmails
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emergencyEmails: user.emergencyEmails
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= FORGOT PASSWORD =================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await sendEmail(
      email,
      'Password Reset',
      `Click here: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    );

    res.json({ message: 'Reset email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ENROLL FACE =================
const enrollFace = async (req, res) => {
  try {
    const { embedding, image } = req.body; // Support both raw embedding or image
    let finalEmbedding = embedding;

    if (!finalEmbedding && image) {
      console.log('🖼️  Generating descriptor from image for enrollment...');
      finalEmbedding = await getDescriptorFromImage(image);
    }
    
    if (!finalEmbedding) {
      return res.status(400).json({ message: 'No face data provided' });
    }

    // Save new sample
    const newEmbedding = new FaceEmbedding({
      userId: req.userId,
      embedding: finalEmbedding
    });

    await newEmbedding.save();
    
    // Update local cache
    const user = await User.findById(req.userId);
    embeddingCache.push({
      userId: req.userId,
      userData: user,
      embedding: finalEmbedding
    });

    res.json({ message: 'Face sample enrolled successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= FACE LOGIN (FACE-ONLY) =================
const faceLogin = async (req, res) => {
  try {
    const { embedding, image } = req.body;
    let incomingEmbedding = embedding;

    if (!incomingEmbedding && image) {
        console.log('🔍 Generating descriptor from scanning image...');
        incomingEmbedding = await getDescriptorFromImage(image);
    }
    
    if (!incomingEmbedding) {
      return res.status(400).json({ message: 'Could not capture face data. Please try again.' });
    }

    if (embeddingCache.length === 0) {
        await populateCache(); // Safety sync
    }

    let bestMatch = null;
    let highestSimilarity = -1;
    const THRESHOLD = 0.75; // Logic: similarity > 0.75 is a match

    console.log(`🕵️ Searching across ${embeddingCache.length} samples...`);

    for (const sample of embeddingCache) {
        const sim = cosineSimilarity(incomingEmbedding, sample.embedding);
        if (sim > highestSimilarity) {
            highestSimilarity = sim;
            bestMatch = sample;
        }
    }

    console.log(`📊 Best match similarity: ${highestSimilarity.toFixed(4)}`);

    if (highestSimilarity < THRESHOLD) {
      return res.status(401).json({ message: 'Face not recognized. Access denied.' });
    }

    const user = bestMatch.userData;
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emergencyEmails: user.emergencyEmails
      }
    });

  } catch (error) {
    console.error('Face Login Error:', error);
    res.status(500).json({ message: 'An internal error occurred during verification.' });
  }
};

// ================= UPDATE PROFILE =================
const updateProfile = async (req, res) => {
  try {
    const { emergencyEmails } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { emergencyEmails }, { new: true });
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const savePushToken = async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.userId, { expoPushToken: req.body.token });
      res.json({ message: 'Push token saved' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

module.exports = {
  register,
  login,
  forgotPassword,
  savePushToken,
  enrollFace,
  faceLogin,
  updateProfile
};