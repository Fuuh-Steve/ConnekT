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
      router.push(role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [role, loading, router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-6 bg-[rgb(var(--bg-main))]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[rgb(var(--accent))]/20 border-t-[rgb(var(--accent))] rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[rgb(var(--accent))]/40 rounded-full animate-spin animation-delay-75"></div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-[rgb(var(--text-main))] font-bold text-lg">Welcome to ConnekT</p>
          <p className="text-[rgb(var(--text-muted))] font-medium uppercase tracking-widest text-xs">Setting up your experience...</p>
        </div>
      </div>
    );
  }

  return <LandingPage />;
}

