# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered faceless video generator SaaS. Users input a prompt, and the system generates scripts, images, and audio using Google Gemini, then composes them into short-form vertical videos using Remotion.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router) with TypeScript
- **AI**: Google Gemini API (@google/genai) for script, image, and TTS generation
- **Video**: Remotion for React-based video composition (540x960, 30fps)
- **Database/Auth/Storage**: Supabase (PostgreSQL, Auth, Storage buckets)
- **UI**: shadcn/ui (new-york style), Tailwind CSS, Radix UI

### Directory Structure
- `src/app/(app)/` - Protected routes (generate, projects)
- `src/app/(auth)/` - Authentication routes (login, signup, verify-email)
- `src/actions/` - Server Actions for all backend operations (no client-side fetching)
- `src/lib/supabase/` - Supabase clients (client.ts for browser, server.ts for server)
- `src/remotion/` - Video composition (compositions/, components/, effects/)
- `src/components/video/` - Video-related UI (player, storyboard, caption/effect selectors)

### Video Generation Pipeline
1. Create project in DB with settings (language, caption style, position)
2. Generate script via Gemini (structured JSON with scenes)
3. Create scene records in DB
4. Parallel generation: images + audio for each scene → upload to Supabase Storage
5. Compose video using Remotion player

### Database Schema
- **projects**: id, user_id, title, prompt, status, language, caption_style, caption_position
- **scenes**: id, project_id, scene_number, narration, visual_prompt, image_url, audio_url, duration_ms, effect
- **user_credits**: id, user_id, credits_remaining (each video costs 1 credit, users start with 10)

### Key Patterns
- All async operations use Next.js Server Actions (src/actions/)
- Auth middleware protects /generate and /projects routes
- Multi-language support: 9 languages stored per-project
- Image effects: Ken Burns, Zoom In/Out, Pan Left/Right, Shake, Pulse (auto-assigned via getAutoEffect)
- Caption styles: Classic, Bold, Minimal, Neon with karaoke animation

## Environment Variables

```
GEMINI_API_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL
```

## Coding Style

- Always use curly braces for control flow, even for single-line bodies
- UI default language must be English
