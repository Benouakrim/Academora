import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Use the provided Supabase URL, or fall back to environment variable
const supabaseUrl = process.env.SUPABASE_URL || 'https://snflmjoiarpvtvqoawvz.supabase.co';
// Prefer the service role key for server-side privileged operations.
// Only fall back to SUPABASE_KEY (anon) if service role is absent.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.warn('⚠️  Warning: No Supabase key found (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY).');
  console.warn('   Add SUPABASE_SERVICE_ROLE_KEY to .env for full server capabilities.');
} else if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('ℹ️  Using anon SUPABASE_KEY (no service role key provided) - privileged operations may fail (RLS).');
}

// Create Supabase client with service role key for server-side operations
// Note: Use service role key (not anon key) for admin operations on the server
// If key is missing, createClient will still work but queries will fail with auth errors
const supabase = createClient(supabaseUrl, supabaseKey || '');

export default supabase;
export { supabase };

