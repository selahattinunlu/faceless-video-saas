# 📋 PRD - ShortsAI Video Generator (Next.js 15 Migration)

## 1. Proje Özeti

**Mevcut Durum**: Prompt girilerek kısa video üreten Vite + React uygulaması. Google Gemini AI kullanarak senaryo, görsel ve ses üretimi yapıyor.

**Hedef**: Next.js 15 App Router, Tailwind CSS, Shadcn/UI ve Supabase ile modern, ölçeklenebilir bir SaaS mimarisine taşımak.

---

## 2. Mevcut Mimari Analizi

### 2.1 Services Katmanı (`@services`)

| Servis | Fonksiyon | Açıklama |
|--------|-----------|----------|
| `geminiService.ts` | `generateScript(topic)` | Kullanıcı prompt'undan 3-5 sahnelik JSON senaryo üretir |
| | `generateSceneImage(visualPrompt)` | `gemini-2.5-flash-image` modeli ile sahne görseli üretir |
| | `generateSceneAudio(text)` | `gemini-2.5-flash-preview-tts` modeli ile seslendirme üretir |
| `audioUtils.ts` | `decodeGeminiAudio()` | Base64 PCM → AudioBuffer dönüşümü (16-bit → Float32) |

### 2.2 Mevcut Akış

```
[Prompt] → generateScript() → [Scenes JSON]
              ↓
    ┌─────────┴─────────┐
    ↓                   ↓
generateSceneImage() generateSceneAudio()
    ↓                   ↓
    └───────→ [Scene Assets] → Player (Canvas) → Export (.webm)
```

### 2.3 Data Types

```typescript
interface ScriptItem {
  scene_number: number;
  narration: string;
  visual_prompt: string;
}

interface GeneratedScene extends ScriptItem {
  id: string;
  imageUrl?: string;
  audioBuffer?: AudioBuffer;
  status: 'pending' | 'loading' | 'complete' | 'error';
}
```

---

## 3. Yeni Mimari (Next.js 15 + Supabase)

### 3.1 Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS 4.x |
| UI Components | Shadcn/UI |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage (görseller, audio) |
| Auth | Supabase Auth |
| AI Backend | Google Gemini AI (Server Actions) |
| Video Processing | FFmpeg.wasm (client-side export) |

### 3.2 Dizin Yapısı

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Ana dashboard
│   │   ├── projects/
│   │   │   ├── page.tsx                # Proje listesi
│   │   │   └── [id]/page.tsx           # Proje detay/editor
│   │   └── settings/page.tsx
│   ├── api/
│   │   └── webhooks/
│   │       └── stripe/route.ts         # (ileride subscription için)
│   └── layout.tsx
├── components/
│   ├── ui/                             # Shadcn components
│   ├── video/
│   │   ├── player.tsx                  # Video oynatıcı
│   │   ├── storyboard.tsx              # Sahne kartları
│   │   ├── scene-card.tsx
│   │   └── export-dialog.tsx
│   ├── prompt-input.tsx
│   └── generation-status.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── gemini/
│   │   ├── client.ts                   # Gemini AI instance
│   │   ├── script-generator.ts
│   │   ├── image-generator.ts
│   │   └── audio-generator.ts
│   ├── audio/
│   │   └── decoder.ts                  # PCM → AudioBuffer
│   └── utils.ts
├── actions/
│   ├── generate-script.ts              # Server Action
│   ├── generate-image.ts               # Server Action
│   ├── generate-audio.ts               # Server Action
│   └── save-project.ts                 # Supabase kayıt
├── hooks/
│   ├── use-video-generation.ts
│   ├── use-audio-player.ts
│   └── use-export.ts
├── types/
│   └── index.ts
└── stores/
    └── generation-store.ts             # Zustand
```

---

## 4. Supabase Schema

### 4.1 Database Tables

```sql
-- Users tablosu (Supabase Auth tarafından yönetilir)

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft', 'generating', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scenes
CREATE TABLE scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  scene_number INTEGER NOT NULL,
  narration TEXT NOT NULL,
  visual_prompt TEXT NOT NULL,
  image_url TEXT,
  audio_url TEXT,
  duration_ms INTEGER,
  status TEXT CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generation Jobs (queue tracking)
CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  job_type TEXT CHECK (job_type IN ('script', 'image', 'audio')),
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- User Credits (usage tracking)
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining INTEGER DEFAULT 10,
  total_videos_generated INTEGER DEFAULT 0
);
```

### 4.2 Storage Buckets

```
- generated-images (public)
- generated-audio (public)
- exported-videos (authenticated)
```

### 4.3 RLS Policies

```sql
-- Projects: sadece sahibi erişebilir
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

-- Scenes: project üzerinden erişim
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own scenes" ON scenes
  FOR ALL USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );
```

---

## 5. Server Actions (API Katmanı)

### 5.1 `actions/generate-script.ts`

```typescript
'use server'

import { GoogleGenAI, Type } from '@google/genai'
import { createClient } from '@/lib/supabase/server'
import { ScriptItem } from '@/types'

export async function generateScript(projectId: string, prompt: string): Promise<ScriptItem[]> {
  const supabase = await createClient()
  
  // Verify ownership
  const { data: project, error } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .single()
  
  if (error || !project) {
    throw new Error('Project not found')
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a short video script... ${prompt}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            scene_number: { type: Type.INTEGER },
            narration: { type: Type.STRING },
            visual_prompt: { type: Type.STRING }
          },
          required: ['scene_number', 'narration', 'visual_prompt']
        }
      }
    }
  })

  const scriptItems = JSON.parse(response.text!) as ScriptItem[]
  
  // Save scenes to database
  for (const item of scriptItems) {
    await supabase.from('scenes').insert({
      project_id: projectId,
      scene_number: item.scene_number,
      narration: item.narration,
      visual_prompt: item.visual_prompt,
      status: 'pending'
    })
  }
  
  return scriptItems
}
```

### 5.2 `actions/generate-image.ts`

```typescript
'use server'

import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/lib/supabase/server'

export async function generateSceneImage(sceneId: string): Promise<string> {
  const supabase = await createClient()
  
  const { data: scene } = await supabase
    .from('scenes')
    .select('visual_prompt, project_id')
    .eq('id', sceneId)
    .single()
  
  if (!scene) {
    throw new Error('Scene not found')
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{
        text: `${scene.visual_prompt}, cinematic lighting, 8k resolution, photorealistic, vertical aspect ratio 9:16`
      }]
    }
  })

  const imageData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData
  if (!imageData?.data) {
    throw new Error('No image generated')
  }

  // Upload to Supabase Storage
  const fileName = `${sceneId}.png`
  const buffer = Buffer.from(imageData.data, 'base64')
  
  await supabase.storage
    .from('generated-images')
    .upload(fileName, buffer, { contentType: imageData.mimeType })

  const { data: { publicUrl } } = supabase.storage
    .from('generated-images')
    .getPublicUrl(fileName)

  // Update scene record
  await supabase
    .from('scenes')
    .update({ image_url: publicUrl })
    .eq('id', sceneId)

  return publicUrl
}
```

### 5.3 `actions/generate-audio.ts`

```typescript
'use server'

import { GoogleGenAI, Modality } from '@google/genai'
import { createClient } from '@/lib/supabase/server'

export async function generateSceneAudio(sceneId: string): Promise<string> {
  const supabase = await createClient()
  
  const { data: scene } = await supabase
    .from('scenes')
    .select('narration')
    .eq('id', sceneId)
    .single()
  
  if (!scene) {
    throw new Error('Scene not found')
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text: scene.narration }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }
        }
      }
    }
  })

  const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
  if (!audioData) {
    throw new Error('No audio generated')
  }

  // Upload raw PCM to storage
  const fileName = `${sceneId}.pcm`
  const buffer = Buffer.from(audioData, 'base64')
  
  await supabase.storage
    .from('generated-audio')
    .upload(fileName, buffer, { contentType: 'audio/pcm' })

  const { data: { publicUrl } } = supabase.storage
    .from('generated-audio')
    .getPublicUrl(fileName)

  await supabase
    .from('scenes')
    .update({ audio_url: publicUrl })
    .eq('id', sceneId)

  return publicUrl
}
```

---

## 6. Client Components

### 6.1 Generation Hook

```typescript
// hooks/use-video-generation.ts
'use client'

import { useState, useTransition } from 'react'
import { generateScript } from '@/actions/generate-script'
import { generateSceneImage } from '@/actions/generate-image'
import { generateSceneAudio } from '@/actions/generate-audio'
import { Scene } from '@/types'

export function useVideoGeneration(projectId: string) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'scripting' | 'assets' | 'ready'>('idle')
  const [scenes, setScenes] = useState<Scene[]>([])

  const generate = async (prompt: string) => {
    setStatus('scripting')
    
    startTransition(async () => {
      const scriptItems = await generateScript(projectId, prompt)
      setScenes(scriptItems.map(s => ({ ...s, status: 'pending' })))
      setStatus('assets')

      // Parallel asset generation
      await Promise.all(
        scriptItems.map(async (scene) => {
          const [imageUrl, audioUrl] = await Promise.all([
            generateSceneImage(scene.id),
            generateSceneAudio(scene.id)
          ])
          
          setScenes(prev => prev.map(s => 
            s.id === scene.id 
              ? { ...s, imageUrl, audioUrl, status: 'complete' } 
              : s
          ))
        })
      )

      setStatus('ready')
    })
  }

  return { generate, isPending, status, scenes }
}
```

---

## 7. Önemli Geliştirmeler

| Özellik | Mevcut | Yeni (Next.js 15) |
|---------|--------|-------------------|
| API Keys | Client-side expose | Server Actions (güvenli) |
| Asset Storage | Memory (geçici) | Supabase Storage (kalıcı) |
| Auth | Yok | Supabase Auth |
| Project History | Yok | Database kayıt |
| Video Export | Client WebM | FFmpeg.wasm (MP4 support) |
| Error Handling | Basic | Retry logic + job queue |
| Rate Limiting | Yok | Credits sistemi |

---

## 8. Milestone Plan

| Hafta | Görev |
|-------|-------|
| 1 | Next.js 15 + Supabase setup, Auth, DB schema |
| 2 | Server Actions (script, image, audio generation) |
| 3 | Dashboard UI + Shadcn components |
| 4 | Video Player (Canvas) + Export logic |
| 5 | Credits sistemi + Polish & Deploy |

---

## 9. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Gemini AI
GEMINI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 10. Notlar

- **Audio Decoding**: Gemini TTS 16-bit PCM döndürür. Client-side'da `decodeGeminiAudio()` fonksiyonu ile AudioBuffer'a çevrilmeli.
- **Video Export**: WebM formatı browser-native desteklenir. MP4 için FFmpeg.wasm kullanılabilir.
- **Rate Limiting**: Gemini API'nin rate limit'lerine dikkat edilmeli, paralel istek sayısı kontrol altında tutulmalı.
