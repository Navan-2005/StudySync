require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro-latest",
  apiVersion: "v1",
  systemInstruction: `You are a supportive and empathetic virtual therapist who specializes in helping users cope with anxiety and stress, particularly in academic or study-related contexts. Your role is to listen actively, validate the user's emotions, and guide them with practical, evidence-based strategies such as cognitive behavioral techniques, mindfulness exercises, breathing methods, and study planning tips. Respond with warmth, patience, and non-judgment. Avoid giving generic motivational quotes unless they are contextually relevant. Always prioritize emotional well-being, and encourage the user to seek professional help if their distress seems severe or persistent.

  Respond in a JSON object with two keys:
  1. "response": your full text reply to the user.
  2. "mood": a single word classification of the user's emotional state based on the conversation context. Use one of: "very low", "low", "neutral", or "happy".`
  });

let chatSession = null;

async function mentalchatbot(prompt, roleHistory = []) {
  try {
    if (!chatSession) {
      chatSession = model.startChat({
        history: roleHistory.map(msg => ({
          role: msg.role, // 'user' or 'model'
          parts: [{ text: msg.content }]
        }))
      });
    }

        const result = await chatSession.sendMessage(prompt);
        const response = result.response;
        console.log(response.text());
        
    try {
    const parsed = JSON.parse(response.text());
    console.log(parsed);
    
    return parsed; // { response: "...", mood: "low" }
    } catch (err) {
    console.error("Failed to parse JSON from model:", err);
    return { response: response.text(), mood: "neutral" }; // fallback
    }
  } catch (error) {
    console.error("Error generating response :", error);
    throw error;
  }
}

module.exports = mentalchatbot;
