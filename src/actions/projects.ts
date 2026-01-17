'use server'

import { createClient } from '@/lib/supabase/server'
import { Project, ProjectWithScenes, Scene, CaptionStyleId, CaptionPosition, LanguageCode } from '@/types'

export async function createProject(
  title: string,
  prompt: string,
  language: LanguageCode = 'en'
): Promise<Project> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      title,
      prompt,
      language,
      status: 'draft'
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`)
  }

  return data as Project
}

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`)
  }

  return data as Project[]
}

export async function getProject(id: string): Promise<ProjectWithScenes | null> {
  const supabase = await createClient()

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (projectError) {
    if (projectError.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch project: ${projectError.message}`)
  }

  const { data: scenes, error: scenesError } = await supabase
    .from('scenes')
    .select('*')
    .eq('project_id', id)
    .order('scene_number', { ascending: true })

  if (scenesError) {
    throw new Error(`Failed to fetch scenes: ${scenesError.message}`)
  }

  return {
    ...project,
    scenes: scenes as Scene[]
  } as ProjectWithScenes
}

export async function updateProjectStatus(
  id: string,
  status: 'draft' | 'generating' | 'completed' | 'failed'
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('projects')
    .update({ status })
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to update project status: ${error.message}`)
  }
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete project: ${error.message}`)
  }
}

export async function updateProjectCaptionSettings(
  id: string,
  captionStyle: CaptionStyleId,
  captionPosition: CaptionPosition
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('projects')
    .update({
      caption_style: captionStyle,
      caption_position: captionPosition
    })
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to update caption settings: ${error.message}`)
  }
}
