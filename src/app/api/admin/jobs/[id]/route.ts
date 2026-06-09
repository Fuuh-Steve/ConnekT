import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/src/lib/adminAuth';
import { supabaseAdmin } from '@/src/lib/supabase-admin';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { id } = await params;

  const { error } = await supabaseAdmin.from('jobs').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
