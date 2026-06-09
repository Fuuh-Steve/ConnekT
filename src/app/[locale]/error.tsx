'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-4xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-[rgb(var(--text-muted))] mb-8 max-w-md">
        An unexpected error occurred. We have been notified and are working on a fix.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-[rgb(var(--accent))] text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
        <Link 
          href="/"
          className="px-6 py-3 bg-[rgb(var(--bg-side))] text-[rgb(var(--text-main))] border border-[rgb(var(--border))] rounded-xl font-bold hover:bg-[rgb(var(--border))] transition-all"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
