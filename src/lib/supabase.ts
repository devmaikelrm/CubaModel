import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://dlnqkmcacfwhbwdjxczw.supabase.co'  // ← tu URL
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // ← tu anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
})

export const TABLE_MODELOS = 'modelos_cuba'
export const VIEW_TOTAL = 'v_modelos_cuba_total'
export const VIEW_REVISADOS = 'v_modelos_cuba_revisados'
export const VIEW_PROVINCIAS = 'v_modelos_cuba_provincias'

