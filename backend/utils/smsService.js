const twilio = require('twilio');

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

exports.sendSMS = async (to, message) => {
  if (!client) {
    console.log('SMS would be sent:', { to, message });
    return { success: true, mock: true };
  }
  
  try {
    const result = await client.messages.create({
      body: message,
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS error:', error);
    return { success: false, error: error.message };
  }
};

exports.makeVoiceCall = async (to, message) => {
  if (!client) {
    console.log('Voice call would be made:', { to, message });
    return { success: true, mock: true };
  }

  try {
    const result = await client.calls.create({
      twiml: `<Response><Say>${message}</Say></Response>`,
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('Voice call error:', error);
    return { success: false, error: error.message };
  }
};