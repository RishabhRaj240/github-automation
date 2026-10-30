import { createClient } from '@supabase/supabase-js';

// Default to your active Supabase project so Vercel builds connect immediately
const DEFAULT_SUPABASE_URL = 'https://xqaotgzboknevbilbuqo.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxYW90Z3pib2tuZXZiaWxidXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyODU4ODcsImV4cCI6MjEwODg2MTg4N30.WWCsK3AIV-SQj0TirnUPGUgP7tp9i9tT6AiUtGeBRmo';

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const supabaseUrl = envUrl && !envUrl.includes('placeholder') ? envUrl : DEFAULT_SUPABASE_URL;
const supabaseAnonKey = envKey && !envKey.includes('placeholder') ? envKey : DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

