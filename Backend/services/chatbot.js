require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro-latest",
  apiVersion: "v1",
  systemInstruction: `You are an intelligent and supportive study assistant. Your primary goal is to help users with study-related queries by providing clear, accurate, and concise explanations. You are capable of answering questions across a wide range of subjects including science, mathematics, history, geography, literature, technology, and exam preparation. When a user asks a study-related question, provide detailed information, helpful examples, tips for understanding, and relevant resources if needed. Always be encouraging and maintain an educational tone..`
});

let chatSession = null;

async function chatbot(prompt, roleHistory = []) {
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
    return response.text();
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw error;
  }
}

module.exports = chatbot;
