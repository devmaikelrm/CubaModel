// Supabase client (browser ESM)
// 1) Edit SUPABASE_URL and SUPABASE_ANON_KEY below, or
// 2) Define window.SUPABASE_URL / window.SUPABASE_ANON_KEY before importing this file
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/esm/index.js';

export const SUPABASE_URL = (window && window.SUPABASE_URL) || 'https://dlnqkmcacfwhbwdjxczw.supabase.co';
export const SUPABASE_ANON_KEY = (window && window.SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsbnFrbWNhY2Z3aGJ3ZGp4Y3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTUwMTYsImV4cCI6MjA3MTgzMTAxNn0.ytem47gk5X7wVBiT_ke-nudkL9kGWdIR1ScxDcMpWck';

export const isSupabaseConfigured = typeof SUPABASE_URL === 'string'
  && SUPABASE_URL.startsWith('http')
  && typeof SUPABASE_ANON_KEY === 'string'
  && !SUPABASE_ANON_KEY.includes('YOUR_');

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Table name used by this app
export const TABLE_MODELOS = 'modelos_cuba';
export const VIEW_TOTAL = 'v_modelos_cuba_total';
export const VIEW_REVISADOS = 'v_modelos_cuba_revisados';
export const VIEW_PROVINCIAS = 'v_modelos_cuba_provincias';
