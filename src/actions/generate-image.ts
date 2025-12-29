'use server'

import { ai } from '@/lib/gemini';

export async function generateSceneImage(visualPrompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: visualPrompt + ", cinematic lighting, 8k resolution, photorealistic, vertical aspect ratio 9:16" }
      ]
    }
  });

  // Extract image from response parts
  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }
  
  throw new Error("No image generated");
}
