import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

if (!config.supabase.url || !config.supabase.anonKey) {
  console.warn('Supabase URL and Anon Key are required! Please check your .env variables.');
}

export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);
