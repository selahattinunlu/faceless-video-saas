'use server'

import { ai } from '@/lib/gemini';
import { Type } from '@google/genai';
import { ScriptItem } from '@/types';

export async function generateScript(topic: string): Promise<ScriptItem[]> {
  const prompt = `
    Create a short video script for a vertical social media video (Shorts/Reels) about: "${topic}".
    The video should be between 30-45 seconds total.
    Break it down into 3 to 5 scenes.
    For each scene, provide:
    1. "narration": The spoken text for the voiceover (keep it punchy and engaging).
    2. "visual_prompt": A detailed image generation prompt to visualize this scene (photorealistic, high quality).
    
    Return ONLY a JSON array.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            scene_number: { type: Type.INTEGER },
            narration: { type: Type.STRING },
            visual_prompt: { type: Type.STRING }
          },
          required: ["scene_number", "narration", "visual_prompt"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No script generated");
  }
  
  try {
    return JSON.parse(text) as ScriptItem[];
  } catch (e) {
    console.error("JSON Parse Error", e);
    throw new Error("Failed to parse script JSON");
  }
}
