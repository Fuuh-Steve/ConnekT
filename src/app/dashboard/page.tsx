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
    if (!loading && role === 'guest') {
      router.push('/login');
    }
  }, [role, loading, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-main))]">
      <div className="w-12 h-12 border-4 border-[rgb(var(--accent))]/20 border-t-[rgb(var(--accent))] rounded-full animate-spin"></div>
    </div>
  );

  if (role === 'student') return <StudentDashboard />;
  if (role === 'recruiter') return <RecruiterDashboard />;
  if (role === 'admin') return <AdminDashboard />;

  return null;
}
