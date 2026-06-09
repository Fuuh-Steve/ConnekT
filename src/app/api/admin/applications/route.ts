import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/src/lib/adminAuth';
import { supabaseAdmin } from '@/src/lib/supabase-admin';

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const page = Number(request.nextUrl.searchParams.get('page') ?? '0');

  const { data, error } = await supabaseAdmin
    .from('applications')
    .select('id, status, created_at, job_id, student_id, jobs(title, company)')
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const hasMore = rows.length > PAGE_SIZE;
  const pageRows = rows.slice(0, PAGE_SIZE);

  const studentIds = Array.from(new Set(pageRows.map((r) => r.student_id).filter(Boolean)));
  let nameMap: Record<string, string | null> = {};
  if (studentIds.length > 0) {
    const { data: profilesData } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .in('id', studentIds);

    nameMap = Object.fromEntries((profilesData ?? []).map((p) => [p.id, p.full_name]));
  }

  const applications = pageRows.map((row) => ({
    ...row,
    studentName: row.student_id ? nameMap[row.student_id] ?? null : null,
  }));

  return NextResponse.json({ applications, hasMore });
}
