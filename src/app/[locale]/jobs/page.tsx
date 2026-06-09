'use client';

import { Suspense } from 'react';
import { JobBoard } from '@/src/views/JobBoard';

function JobBoardFallback() {
  return (
    <div className="h-96 flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-[rgb(var(--accent))]/20 border-t-[rgb(var(--accent))] rounded-full animate-spin"></div>
      <p className="text-[rgb(var(--text-muted))] font-bold uppercase tracking-widest text-xs">Loading Internships...</p>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<JobBoardFallback />}>
      <JobBoard />
    </Suspense>
  );
}
