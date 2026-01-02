'use server'

import { createClient } from '@/lib/supabase/server'
import { UserCredits } from '@/types'

export async function getUserCredits(): Promise<UserCredits | null> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return null
  }

  const { data, error } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    // If no credits record exists, create one (for existing users)
    if (error.code === 'PGRST116') {
      const { data: newCredits, error: insertError } = await supabase
        .from('user_credits')
        .insert({
          user_id: user.id,
          credits_remaining: 10,
          total_videos_generated: 0
        })
        .select()
        .single()

      if (insertError) {
        throw new Error(`Failed to create credits: ${insertError.message}`)
      }

      return newCredits as UserCredits
    }
    throw new Error(`Failed to fetch credits: ${error.message}`)
  }

  return data as UserCredits
}

export async function decrementCredits(): Promise<UserCredits> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Not authenticated')
  }

  // Get current credits
  const currentCredits = await getUserCredits()
  if (!currentCredits || currentCredits.credits_remaining <= 0) {
    throw new Error('No credits remaining')
  }

  const { data, error } = await supabase
    .from('user_credits')
    .update({
      credits_remaining: currentCredits.credits_remaining - 1,
      total_videos_generated: currentCredits.total_videos_generated + 1
    })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update credits: ${error.message}`)
  }

  return data as UserCredits
}

export async function hasCredits(): Promise<boolean> {
  const credits = await getUserCredits()
  return credits !== null && credits.credits_remaining > 0
}
