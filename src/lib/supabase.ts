import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://dlnqkmcacfwhbwdjxczw.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsbnFrbWNhY2Z3aGJ3ZGp4Y3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTUwMTYsImV4cCI6MjA3MTgzMTAxNn0.ytem47gk5X7wVBiT_ke-nudkL9kGWdIR1ScxDcMpWck'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
})

export const TABLE_MODELOS = 'modelos_cuba'
export const VIEW_TOTAL = 'v_modelos_cuba_total'
export const VIEW_REVISADOS = 'v_modelos_cuba_revisados'
export const VIEW_PROVINCIAS = 'v_modelos_cuba_provincias'

