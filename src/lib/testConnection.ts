import { supabase } from './supabase';

/**
 * Test backend connectivity and RLS policies
 */
export async function testBackendConnection() {
  const results = {
    supabaseConnected: false,
    authWorking: false,
    profilesAccessible: false,
    jobsAccessible: false,
    applicationsAccessible: false,
    errors: [] as string[]
  };

  try {
    // Test 1: Verify Supabase client is initialized
    if (!supabase) {
      results.errors.push('Supabase client not initialized');
      return results;
    }
    results.supabaseConnected = true;
    console.log('✓ Supabase client initialized');

    // Test 2: Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      results.errors.push(`Auth error: ${sessionError.message}`);
    } else if (!session) {
      console.log('ℹ No active session (expected if not logged in)');
    } else {
      results.authWorking = true;
      console.log('✓ Authentication working');
    }

    // Test 3: Try to access profiles table (read-only, should work for everyone)
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      results.errors.push(`Profiles table error: ${profilesError.message}`);
      console.log('✗ Cannot access profiles table:', profilesError.message);
    } else {
      results.profilesAccessible = true;
      console.log('✓ Profiles table accessible');
    }

    // Test 4: Try to access jobs table (read-only, should work for everyone)
    const { data: jobsData, error: jobsError } = await supabase
      .from('jobs')
      .select('count')
      .limit(1);
    
    if (jobsError) {
      results.errors.push(`Jobs table error: ${jobsError.message}`);
      console.log('✗ Cannot access jobs table:', jobsError.message);
    } else {
      results.jobsAccessible = true;
      console.log('✓ Jobs table accessible');
    }

    // Test 5: Try to access applications table
    const { data: applicationsData, error: applicationsError } = await supabase
      .from('applications')
      .select('count')
      .limit(1);
    
    if (applicationsError) {
      // This might fail if not logged in, which is expected
      console.log('ℹ Applications table requires authentication:', applicationsError.message);
    } else {
      results.applicationsAccessible = true;
      console.log('✓ Applications table accessible');
    }

  } catch (error: any) {
    results.errors.push(`Unexpected error: ${error.message}`);
    console.error('Test error:', error);
  }

  return results;
}

/**
 * Validate environment variables
 */
export function validateEnvironment() {
  const issues = [] as string[];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    issues.push('NEXT_PUBLIC_SUPABASE_URL is not set');
  } else if (url.includes(' ')) {
    issues.push('NEXT_PUBLIC_SUPABASE_URL has extra spaces');
  } else if (!url.startsWith('https://')) {
    issues.push('NEXT_PUBLIC_SUPABASE_URL must start with https://');
  }

  if (!key) {
    issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  } else if (key.includes(' ')) {
    issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY has extra spaces');
  } else if (key.length < 100) {
    issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY looks invalid (too short)');
  }

  if (issues.length === 0) {
    console.log('✓ Environment variables are properly configured');
    return { valid: true, issues: [] };
  }

  console.error('✗ Environment configuration issues found:');
  issues.forEach(issue => console.error(`  - ${issue}`));
  return { valid: false, issues };
}
