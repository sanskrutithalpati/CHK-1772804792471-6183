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
      systemInstruction: "You are 'Career AI', an expert career coach and professional advisor. Your goal is to help users with resume building, interview preparation, career transitions, salary negotiations, and professional development. Provide actionable, encouraging, and highly professional advice. Use Markdown for formatting.",
    },
    // history: history.slice(0, -1), // The latest message is sent via sendMessage
  });

  // If history is provided, we should ideally initialize the chat with it.
  // However, the SDK examples show sendMessage.
  
  const response: GenerateContentResponse = await chat.sendMessage({ message: prompt });
  return response.text;
};
