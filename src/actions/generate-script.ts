'use server'

import { ai } from '@/lib/gemini';
import { Type } from '@google/genai';
import { ScriptItem, Scene, LanguageCode, SUPPORTED_LANGUAGES, EditableScene } from '@/types';
import { createClient } from '@/lib/supabase/server';
import { getAutoEffect } from '@/lib/effect-assigner';

function getLanguageName(code: LanguageCode): string {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang?.name || 'English';
}

// Original function for generating script without DB persistence (for preview)
export async function generateScriptPreview(topic: string, language: LanguageCode = 'en'): Promise<ScriptItem[]> {
  const languageName = getLanguageName(language);

  const prompt = `
    Create a short video script for a vertical social media video (Shorts/Reels) about: "${topic}".
    The video should be between 30-45 seconds total.
    Break it down into 3 to 5 scenes.

    IMPORTANT: Write all narration text in ${languageName} language.

    For each scene, provide:
    1. "narration": The spoken text for the voiceover in ${languageName} (keep it punchy and engaging).
    2. "visual_prompt": A detailed image generation prompt to visualize this scene (photorealistic, high quality). Always write visual prompts in English.

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

  // Verify project exists and get prompt and language
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('prompt, language')
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

  // Generate script using AI with the project's language
  const language = (project.language as LanguageCode) || 'en';
  const scriptItems = await generateScriptPreview(project.prompt, language);

  // Insert scenes into database
  const scenesToInsert = scriptItems.map(item => ({
    project_id: projectId,
    scene_number: item.scene_number,
    narration: item.narration,
    visual_prompt: item.visual_prompt,
    effect: getAutoEffect(item.scene_number),
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

// Generate scenes from user's custom transcript
export async function generateScenesFromTranscript(
  transcript: string,
  language: LanguageCode = 'en'
): Promise<EditableScene[]> {
  const languageName = getLanguageName(language);

  const prompt = `
    You are given a transcript for a short video. Split this transcript into logical scenes (3-5 scenes).

    The transcript is in ${languageName} language.

    For each scene:
    1. Keep the original narration text as-is (don't modify it)
    2. Create a detailed visual_prompt in English to visualize this scene

    Transcript:
    "${transcript}"

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
    throw new Error("No scenes generated from transcript");
  }

  try {
    const scenes = JSON.parse(text) as ScriptItem[];
    // Convert to EditableScene format with temporary IDs
    return scenes.map((scene, index) => ({
      id: `temp-${Date.now()}-${index}`,
      scene_number: scene.scene_number,
      narration: scene.narration,
      visual_prompt: scene.visual_prompt,
    }));
  } catch (e) {
    console.error("JSON Parse Error", e);
    throw new Error("Failed to parse scenes JSON");
  }
}

// Save edited scenes to database (called after scene editing in wizard)
export async function saveScenesToProject(
  projectId: string,
  scenes: EditableScene[]
): Promise<Scene[]> {
  const supabase = await createClient();

  // Delete existing scenes for this project (if any)
  await supabase
    .from('scenes')
    .delete()
    .eq('project_id', projectId);

  // Insert new scenes with auto-assigned effects
  const scenesToInsert = scenes.map((scene, index) => ({
    project_id: projectId,
    scene_number: index + 1, // Use array index for ordering
    narration: scene.narration,
    visual_prompt: scene.visual_prompt,
    effect: getAutoEffect(index + 1),
    status: 'pending'
  }));

  const { data: savedScenes, error: insertError } = await supabase
    .from('scenes')
    .insert(scenesToInsert)
    .select();

  if (insertError) {
    throw new Error(`Failed to save scenes: ${insertError.message}`);
  }

  return savedScenes as Scene[];
}
