'use server'

import { createClient } from '@/lib/supabase/server'
import { Project, ProjectWithScenes, Scene, CaptionStyleId, CaptionPosition, LanguageCode, ImageEffectId, Transition } from '@/types'

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

export async function updateSceneEffect(
  sceneId: string,
  effect: ImageEffectId
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('scenes')
    .update({ effect })
    .eq('id', sceneId)

  if (error) {
    throw new Error(`Failed to update scene effect: ${error.message}`)
  }
}

// Update project wizard settings
export async function updateProjectSettings(
  projectId: string,
  settings: {
    imageStyle?: string | null;
    customImageStyle?: string | null;
    voiceId?: string | null;
    captionStyle?: string | null;
    captionPosition?: string | null;
    wizardStep?: string | null;
  }
): Promise<void> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};

  if (settings.imageStyle !== undefined) {
    updateData.image_style = settings.imageStyle;
  }
  if (settings.customImageStyle !== undefined) {
    updateData.custom_image_style = settings.customImageStyle;
  }
  if (settings.voiceId !== undefined) {
    updateData.voice_id = settings.voiceId;
  }
  if (settings.captionStyle !== undefined) {
    updateData.caption_style = settings.captionStyle;
  }
  if (settings.captionPosition !== undefined) {
    updateData.caption_position = settings.captionPosition;
  }
  if (settings.wizardStep !== undefined) {
    updateData.wizard_step = settings.wizardStep;
  }

  const { error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', projectId);

  if (error) {
    throw new Error(`Failed to update project settings: ${error.message}`);
  }
}

// Delete all scenes for a project (used when going back to step 1)
export async function deleteProjectScenes(projectId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('scenes')
    .delete()
    .eq('project_id', projectId);

  if (error) {
    throw new Error(`Failed to delete scenes: ${error.message}`);
  }
}

// Update scene transitions
export async function updateSceneTransitions(
  sceneId: string,
  enterTransition: Transition,
  exitTransition: Transition
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('scenes')
    .update({
      enter_transition: enterTransition,
      exit_transition: exitTransition,
    })
    .eq('id', sceneId);

  if (error) {
    throw new Error(`Failed to update scene transitions: ${error.message}`);
  }
}
