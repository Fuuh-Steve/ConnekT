import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// Validate configuration on initialization
const validateConfig = () => {
  const issues: string[] = [];
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    issues.push('NEXT_PUBLIC_SUPABASE_URL is missing');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
  }
  
  if (issues.length > 0) {
    console.error('🔴 Supabase Configuration Error:', issues.join(', '));
    return false;
  }
  
  return true;
};

if (!validateConfig()) {
  console.warn('⚠️ Supabase credentials missing during build or runtime. Backend will not be available.');
} else {
  console.log('✅ Supabase client configured successfully');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
