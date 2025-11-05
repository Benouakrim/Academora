import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Use the provided Supabase URL, or fall back to environment variable
const supabaseUrl = process.env.SUPABASE_URL || 'https://snflmjoiarpvtvqoawvz.supabase.co';
// Use SUPABASE_KEY or SUPABASE_SERVICE_ROLE_KEY from environment variables
// IMPORTANT: Use the service_role key (not anon key) for server-side operations
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.warn('⚠️  Warning: SUPABASE_KEY or SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  console.warn('   Create a .env file in the root directory with your Supabase credentials.');
  console.warn('   See server/database/README.md for setup instructions.');
}

// Create Supabase client with service role key for server-side operations
// Note: Use service role key (not anon key) for admin operations on the server
// If key is missing, createClient will still work but queries will fail with auth errors
const supabase = createClient(supabaseUrl, supabaseKey || '');

export default supabase;

