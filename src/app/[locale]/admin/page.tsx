'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDashboard } from '@/src/views/AdminDashboard';
import { useAuth } from '@/src/context/AuthContext';

export default function AdminPage() {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role !== 'admin') {
      router.push(role === 'guest' ? '/auth' : '/dashboard');
    }
  }, [role, loading, router]);

  // Only block with a spinner on first load when role is genuinely unknown
  if (loading && role === 'guest') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-main))]">
        <div className="w-12 h-12 border-4 border-[rgb(var(--accent))]/20 border-t-[rgb(var(--accent))] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (role !== 'admin') {
    return null;
  }

  return <AdminDashboard />;
}
