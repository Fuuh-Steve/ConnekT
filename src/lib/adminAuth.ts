import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from './supabase-admin';

export async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');

  if (!token) {
    return { error: NextResponse.json({ error: 'Missing authorization token' }, { status: 401 }) };
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) {
    return { error: NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (profileError || profile?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) };
  }

  return { user: userData.user };
}
