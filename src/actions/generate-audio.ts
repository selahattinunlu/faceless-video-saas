'use server'

import { ai } from '@/lib/gemini';
import { Modality } from '@google/genai';
import { createClient } from '@/lib/supabase/server';

// Original function that returns base64 audio (for preview/non-persisted use)
export async function generateSceneAudioPreview(text: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("No audio generated");
  }

  return base64Audio;
}

// New function that uploads to Supabase Storage and updates DB
export async function generateSceneAudio(sceneId: string): Promise<string> {
  const supabase = await createClient();

  // Get scene data
  const { data: scene, error: sceneError } = await supabase
    .from('scenes')
    .select('narration, project_id')
    .eq('id', sceneId)
    .single();

  if (sceneError || !scene) {
    throw new Error('Scene not found');
  }

  try {
    // Generate audio using Gemini TTS
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: scene.narration }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio generated");
    }

    // Convert base64 to buffer and upload to Supabase Storage
    const buffer = Buffer.from(base64Audio, 'base64');
    const fileName = `${scene.project_id}/${sceneId}.pcm`;

    const { error: uploadError } = await supabase.storage
      .from('generated-audio')
      .upload(fileName, buffer, {
        contentType: 'audio/pcm',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Failed to upload audio: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('generated-audio')
      .getPublicUrl(fileName);

    // Update scene record with audio URL
    const { error: updateError } = await supabase
      .from('scenes')
      .update({ audio_url: publicUrl })
      .eq('id', sceneId);

    if (updateError) {
      throw new Error(`Failed to update scene: ${updateError.message}`);
    }

    return publicUrl;

  } catch (error) {
    // Update scene status to failed
    await supabase
      .from('scenes')
      .update({ status: 'failed' })
      .eq('id', sceneId);
    throw error;
  }
}

// Helper to mark scene as completed after both image and audio are done
export async function markSceneCompleted(sceneId: string): Promise<void> {
  const supabase = await createClient();

  const { data: scene, error: sceneError } = await supabase
    .from('scenes')
    .select('image_url, audio_url')
    .eq('id', sceneId)
    .single();

  if (sceneError || !scene) {
    throw new Error('Scene not found');
  }

  // Only mark as completed if both assets are present
  if (scene.image_url && scene.audio_url) {
    await supabase
      .from('scenes')
      .update({ status: 'completed' })
      .eq('id', sceneId);
  }
}
