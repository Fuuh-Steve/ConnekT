'use client';

import { LandingPage } from '@/src/views/LandingPage';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Loader2 } from 'lucide-react';

export default function Home() {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role !== 'guest') {
      router.push('/dashboard');
    }
  }, [role, loading, router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-[rgb(var(--bg-main))]">
        <Loader2 className="w-10 h-10 text-[rgb(var(--accent))] animate-spin" />
        <p className="text-[rgb(var(--text-muted))] font-bold uppercase tracking-widest text-xs">Initializing...</p>
      </div>
    );
  }

  return <LandingPage />;
}

