import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  url &&
  key &&
  !url.includes('여기에') &&
  !key.includes('여기에')
)

export const supabase = isSupabaseConfigured ? createClient(url, key) : null
