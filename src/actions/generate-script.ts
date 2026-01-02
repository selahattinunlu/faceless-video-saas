'use server'

import { ai } from '@/lib/gemini';
import { Type } from '@google/genai';
import { ScriptItem, Scene } from '@/types';
import { createClient } from '@/lib/supabase/server';

// Original function for generating script without DB persistence (for preview)
export async function generateScriptPreview(topic: string): Promise<ScriptItem[]> {
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

// New function that persists to database
export async function generateScript(projectId: string): Promise<Scene[]> {
  const supabase = await createClient();

  // Verify project exists and get prompt
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('prompt')
    .eq('id', projectId)
    .single();

  if (projectError || !project) {
    throw new Error('Project not found');
  }

  // Update project status to generating
  await supabase
    .from('projects')
    .update({ status: 'generating' })
    .eq('id', projectId);

  // Generate script using AI
  const scriptItems = await generateScriptPreview(project.prompt);

  // Insert scenes into database
  const scenesToInsert = scriptItems.map(item => ({
    project_id: projectId,
    scene_number: item.scene_number,
    narration: item.narration,
    visual_prompt: item.visual_prompt,
    status: 'pending'
  }));

  const { data: scenes, error: insertError } = await supabase
    .from('scenes')
    .insert(scenesToInsert)
    .select();

  if (insertError) {
    // Mark project as failed
    await supabase
      .from('projects')
      .update({ status: 'failed' })
      .eq('id', projectId);
    throw new Error(`Failed to save scenes: ${insertError.message}`);
  }

  return scenes as Scene[];
}

// Helper to update scene status
export async function updateSceneStatus(
  sceneId: string,
  status: 'pending' | 'generating' | 'completed' | 'failed'
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('scenes')
    .update({ status })
    .eq('id', sceneId);

  if (error) {
    throw new Error(`Failed to update scene status: ${error.message}`);
  }
}
