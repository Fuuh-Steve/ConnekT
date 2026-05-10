'use client';

import { StudentDashboard } from '@/src/views/StudentDashboard';
import { RecruiterDashboard } from '@/src/views/RecruiterDashboard';
import { AdminDashboard } from '@/src/views/AdminDashboard';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { role, loading } = useAuth();
  const router = useRouter();

  console.log('DashboardPage: role =', role, 'loading =', loading);

  useEffect(() => {
    if (!loading) {
      if (role === 'guest') {
        router.push('/login');
      } else if (role === 'admin') {
        router.push('/admin');
      }
    }
  }, [role, loading, router]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[rgb(var(--bg-main))]">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-[rgb(var(--accent))]/20 border-t-[rgb(var(--accent))] rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-[rgb(var(--accent))]/40 rounded-full animate-spin animation-delay-75"></div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-[rgb(var(--text-main))] font-bold text-lg">Loading your dashboard</p>
        <p className="text-[rgb(var(--text-muted))] font-medium uppercase tracking-widest text-xs">Preparing your personalized experience...</p>
      </div>
    </div>
  );

  if (role === 'student') return <StudentDashboard />;
  if (role === 'recruiter') return <RecruiterDashboard />;
  if (role === 'admin') return <AdminDashboard />;

  return null;
}
