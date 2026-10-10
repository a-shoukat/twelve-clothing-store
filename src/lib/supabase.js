import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase env vars missing. Copy .env.example to .env and fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const STORE_WHATSAPP =
  import.meta.env.VITE_STORE_WHATSAPP || '923001234567';
export const STORE_INSTAGRAM =
  import.meta.env.VITE_STORE_INSTAGRAM || 'https://www.instagram.com/';
