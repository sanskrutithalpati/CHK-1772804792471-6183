import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const getGeminiResponse = async (prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // We use sendMessage for chat-like behavior if we want history, 
  // but for simplicity and following the examples, we can use chats.create
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are 'CareerAI', a friendly, knowledgeable, and supportive career coach. Talk like a close friend—warm, informal, and encouraging. Keep your responses short, punchy, and actionable. Avoid long paragraphs. Focus on helping with resumes, interviews, and career growth in a conversational way. Use Markdown sparingly for clarity.",
    },
    // history: history.slice(0, -1), // The latest message is sent via sendMessage
  });

  // If history is provided, we should ideally initialize the chat with it.
  // However, the SDK examples show sendMessage.
  
  const response: GenerateContentResponse = await chat.sendMessage({ message: prompt });
  return response.text;
};
