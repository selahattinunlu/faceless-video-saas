import { GoogleGenAI } from "@google/genai";

// Server-side only - API key is not exposed to client
const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set');
}

export const ai = new GoogleGenAI({ apiKey });
