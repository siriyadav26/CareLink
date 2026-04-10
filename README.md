# CareLink AI: Open Innovation in Healthcare & Assistive Tech

CareLink AI is a comprehensive assistant for elderly individuals, designed to improve patient care, accessibility, and emergency response through AI and integrated sensor technology.

## 🚀 Key Features

### 1. Advanced Fall Detection (Open Innovation)
- **Multi-Sensor Fusion**: Combines Accelerometer and Gyroscope data to differentiate between accidental drops and genuine human falls.
- **Smart SOS Protocol**: 15-second countdown with an audible alarm and Text-to-Speech (TTS) guidance.
- **Automated Alerts**: Sends GPS-tagged SOS emails to emergency contacts if the user is unresponsive.

### 2. Intelligent Health Monitoring
- **AI Healthcare Chatbot**: Powered by Groq (Llama 3.1), providing empathetic medical advice, mood-based interaction, and medication guidance.
- **Medicine Adherence**: Smart scheduling with push notifications and a "Snooze" feature for flexible care.
- **Mood Tracking**: Visualizes emotional health over time using dynamic charts.

### 3. Accessible UI & Security
- **Face Recognition Login**: High-security login using `face-api.js` and `expo-camera`.
- **Accessibility Suite**: High-contrast themes, large text configurations, and multi-modal feedback (Sound buttons + TTS).
- **Remote Caregiver Dashboard**: Separate interface for families to monitor patient well-being, meds, and mood in real-time.

### 4. Cognitive Support
- **Brain Training Games**: Adaptive memory and reflex games to maintain mental agility.

## 🛠️ Tech Stack
- **Frontend**: React Native (Expo)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **AI**: Groq SDK (Llama 3.1)
- **Sensors**: Expo-Sensors (Accelerometer, Gyroscope)
- **Notifications**: Expo-Notifications, Twilio (Voice/SMS), Nodemailer (Email)

## 📋 Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB (local or Atlas)
- Expo Go app on physical device (recommended for sensors)

### Backend Setup
1. `cd backend`
2. `npm install`
3. Configure `.env` (Rename `.env.example` to `.env`):
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GROQ_API_KEY`
   - `EMAIL_USER` / `EMAIL_PASS` (Gmail App Password)
4. `node server.js`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npx expo start`

### Dashboard Setup
1. `cd caregiver-dashboard`
2. `npm install`
3. `npm run dev`

## 🏥 Hackathon Demo Guide
1. **Login**: Use Face Recognition for a "Wow" factor.
2. **Settings**: Enable "High Contrast" to showcase accessibility.
3. **Fall Detection**: Simulate a fall (shake device). Watch the alarm, hear the TTS, and confirm the SOS email arrival.
4. **Chatbot**: Ask "How can I maintain my health today?" to see the AI integration.
