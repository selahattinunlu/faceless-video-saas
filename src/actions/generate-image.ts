'use server'

import { ai } from '@/lib/gemini';
import { createClient } from '@/lib/supabase/server';

// Original function that returns base64 data URL (for preview/non-persisted use)
export async function generateSceneImagePreview(visualPrompt: string): Promise<string> {
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

// New function that uploads to Supabase Storage and updates DB
export async function generateSceneImage(sceneId: string): Promise<string> {
  const supabase = await createClient();

  // Get scene data
  const { data: scene, error: sceneError } = await supabase
    .from('scenes')
    .select('visual_prompt, project_id')
    .eq('id', sceneId)
    .single();

  if (sceneError || !scene) {
    throw new Error('Scene not found');
  }

  // Update scene status to generating
  await supabase
    .from('scenes')
    .update({ status: 'generating' })
    .eq('id', sceneId);

  try {
    // Generate image using Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: scene.visual_prompt + ", cinematic lighting, 8k resolution, photorealistic, vertical aspect ratio 9:16" }
        ]
      }
    });

    // Extract image data
    const parts = response.candidates?.[0]?.content?.parts;
    let imageData: { data: string; mimeType: string } | null = null;

    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          imageData = {
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType || 'image/png'
          };
          break;
        }
      }
    }

    if (!imageData) {
      throw new Error("No image generated");
    }

    // Convert base64 to buffer and upload to Supabase Storage
    const buffer = Buffer.from(imageData.data, 'base64');
    const extension = imageData.mimeType.split('/')[1] || 'png';
    const fileName = `${scene.project_id}/${sceneId}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(fileName, buffer, {
        contentType: imageData.mimeType,
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('generated-images')
      .getPublicUrl(fileName);

    // Update scene record with image URL
    const { error: updateError } = await supabase
      .from('scenes')
      .update({ image_url: publicUrl })
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
