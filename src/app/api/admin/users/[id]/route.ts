import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/src/lib/adminAuth';
import { supabaseAdmin } from '@/src/lib/supabase-admin';

const VALID_ROLES = ['student', 'recruiter', 'admin'];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const { role } = body;

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('profiles').update({ role }).eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { id } = await params;

  if (id === auth.user.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabaseAdmin.from('profiles').delete().eq('id', id);

  return NextResponse.json({ success: true });
}
