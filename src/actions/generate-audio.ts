'use server'

import { ai } from '@/lib/gemini';
import { Modality } from '@google/genai';
import { createClient } from '@/lib/supabase/server';

// Convert PCM buffer to WAV format
function pcmToWav(pcmBuffer: Buffer): Buffer {
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const headerSize = 44;
  const fileSize = headerSize + dataSize - 8;

  const wavBuffer = Buffer.alloc(headerSize + dataSize);

  // RIFF chunk
  wavBuffer.write('RIFF', 0);
  wavBuffer.writeUInt32LE(fileSize, 4);
  wavBuffer.write('WAVE', 8);

  // fmt chunk
  wavBuffer.write('fmt ', 12);
  wavBuffer.writeUInt32LE(16, 16); // fmt chunk size
  wavBuffer.writeUInt16LE(1, 20); // audio format (PCM = 1)
  wavBuffer.writeUInt16LE(numChannels, 22);
  wavBuffer.writeUInt32LE(sampleRate, 24);
  wavBuffer.writeUInt32LE(byteRate, 28);
  wavBuffer.writeUInt16LE(blockAlign, 32);
  wavBuffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  wavBuffer.write('data', 36);
  wavBuffer.writeUInt32LE(dataSize, 40);

  // Copy PCM data
  pcmBuffer.copy(wavBuffer, 44);

  return wavBuffer;
}

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

    // Convert base64 to buffer and then to WAV format
    const pcmBuffer = Buffer.from(base64Audio, 'base64');
    const wavBuffer = pcmToWav(pcmBuffer);
    const fileName = `${scene.project_id}/${sceneId}.wav`;

    const { error: uploadError } = await supabase.storage
      .from('generated-audio')
      .upload(fileName, wavBuffer, {
        contentType: 'audio/wav',
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
