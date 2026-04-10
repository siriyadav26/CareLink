const Groq = require('groq-sdk');
const ChatLog = require('../models/ChatLog');

const getGroqClient = () => {
  const apiKey = (process.env.GROQ_API_KEY || '').trim();
  return new Groq({ apiKey });
};

const systemPrompt = `You are a caring healthcare assistant for elderly users. 
Provide helpful advice about medications, wellness tips, exercises, and emotional support. 
Keep responses short, clear, and encouraging. Use simple language.`;

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    console.log(`🤖 CHATBOT: Received message from user ${req.userId}: "${message}"`);
    
    let reply = "";
    if (process.env.GROQ_API_KEY) {
      const keyPrefix = (process.env.GROQ_API_KEY || '').substring(0, 10);
      console.log("🤖 CHATBOT: Using Groq API with key:", keyPrefix + "...");
      const groq = getGroqClient();
      const completion = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || "llama3-70b-8192",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 200,
        temperature: 0.7,
      });
      reply = completion.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
    } else {
      // Fallback responses
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('medicine') || lowerMsg.includes('pill')) {
        reply = "Please take your medicines as prescribed. I can remind you if you set up reminders in the app.";
      } else if (lowerMsg.includes('exercise')) {
        reply = "Try gentle arm raises or seated leg lifts for 5 minutes. Always consult your doctor first.";
      } else if (lowerMsg.includes('sad') || lowerMsg.includes('lonely')) {
        reply = "I'm here for you. Would you like to play a game or talk about something that makes you happy?";
      } else {
        reply = "I'm here to help with health advice, medicine reminders, or just to chat. What would you like to know?";
      }
    }
    
    try {
      await ChatLog.create({ userId: req.userId, message, reply });
    } catch (logError) {
      console.error("🤖 CHATBOT: Failed to save chat log to DB:", logError.message);
    }
    res.json({ reply });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ message: 'Chatbot error', reply: "I'm having trouble responding. Please try again later." });
  }
};

exports.handleVoiceCommand = async (req, res) => {
  try {
    const { transcription } = req.body; // In a real app, this would come from Whisper
    
    const nluPrompt = `Analyze this voice command from an elderly user: "${transcription}". 
    Categorize it into one of: TAKE_MEDICINE, OPEN_GAMES, CALL_HELP, CHAT. 
    Respond ONLY with the category and a brief user-friendly confirmation. 
    Format: CATEGORY | CONFIRMATION`;

    let reply = "I'm not sure how to help with that command.";
    let category = "CHAT";

    if (process.env.GROQ_API_KEY) {
      const groq = getGroqClient();
      const completion = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: nluPrompt }],
        max_tokens: 50,
      });
      const responseText = completion.choices[0]?.message?.content || "";
      const parts = responseText.split('|');
      category = parts[0]?.trim() || "CHAT";
      reply = parts[1]?.trim() || "I've processed your command.";
    }

    res.json({ category, reply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
