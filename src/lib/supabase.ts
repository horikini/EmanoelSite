import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please check seu ambiente/Settings na plataforma.');
}

// Basic validation to prevent 'Failed to fetch' due to missing https://
let validUrl = supabaseUrl;
if (validUrl && !validUrl.startsWith('http')) {
  validUrl = 'https://' + validUrl;
}

export const supabase = createClient(
  validUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
