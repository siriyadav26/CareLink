require('dotenv').config({ override: true });

console.log('🏁 SERVER STARTING...');

process.on('uncaughtException', (err) => {
  console.error('🔥 CRITICAL ERROR:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('🌊 UNHANDLED PROMISE:', reason);
  process.exit(1);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Routes
const authRoutes = require('./routes/auth');
const medicineRoutes = require('./routes/medicines');
const moodRoutes = require('./routes/moods');
const gameRoutes = require('./routes/games');
const chatbotRoutes = require('./routes/chatbot');
const sosRoutes = require('./routes/sos');
const caregiverRoutes = require('./routes/caregiver');

// Jobs
const { startMedicineReminderJob } = require('./jobs/medicineReminder');

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// ================= RATE LIMIT =================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  message: 'Too many requests from this IP',
});
app.use('/api/', limiter);

// ================= ROUTES =================
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/caregiver', caregiverRoutes);

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error('❌ ERROR:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ================= DATABASE =================
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  // Start background jobs
  startMedicineReminderJob();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
});