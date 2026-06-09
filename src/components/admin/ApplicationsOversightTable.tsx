'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { AdminApplicationRow } from '../../types';

const PAGE_SIZE = 10;

export const ApplicationsOversightTable = () => {
  const t = useTranslations('admin.applications');
  const [applications, setApplications] = useState<AdminApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`/api/admin/applications?page=${page}`, {
          headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || t('errorFallback'));
        }

        const body = await res.json();
        setApplications(body.applications ?? []);
        setHasMore(Boolean(body.hasMore));
      } catch (err) {
        console.error('Failed to load applications', err);
        setError(err instanceof Error ? err.message : t('errorFallback'));
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [page, t]);

  const statusClass = (status: string) => {
    const key = status.toLowerCase();
    if (key === 'accepted' || key === 'offer received') return 'bg-green-500/10 text-green-600 border-green-500/20';
    if (key === 'interview') return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    if (key === 'rejected') return 'bg-red-500/10 text-red-600 border-red-500/20';
    return 'bg-slate-100 dark:bg-slate-800 text-[rgb(var(--text-muted))] border-[rgb(var(--border))]';
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-side))] p-6 text-center text-sm text-[rgb(var(--text-muted))]">{t('loading')}</div>
      ) : (
        <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-main))] overflow-hidden shadow-sm">
          {applications.length > 0 ? (
            applications.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between p-5 border-b last:border-b-0 border-[rgb(var(--border))]"
              >
                <div className="min-w-0">
                  <h3 className="font-bold text-[rgb(var(--text-main))] truncate">
                    {app.jobs?.title || t('fallbackTitle')}
                  </h3>
                  <p className="text-sm text-[rgb(var(--text-muted))] truncate">
                    {app.jobs?.company || t('fallbackCompany')}
                  </p>
                  <p className="text-[10px] uppercase tracking-tight text-[rgb(var(--text-muted))] mt-1">
                    {t('applicantLabel')}: {app.studentName || t('fallbackApplicant')}
                    {app.created_at && ` • ${new Date(app.created_at).toLocaleDateString()}`}
                  </p>
                </div>
                <span className={cn(
                  'text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border self-start sm:self-center shrink-0',
                  statusClass(String(app.status))
                )}>
                  {app.status}
                </span>
              </motion.div>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-[rgb(var(--text-muted))]">{t('empty')}</div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0 || loading}
          className="px-4 py-2 rounded-xl border border-[rgb(var(--border))] text-xs font-bold disabled:opacity-40"
        >
          {t('previous')}
        </button>
        <span className="text-xs font-bold text-[rgb(var(--text-muted))]">{t('page', { page: page + 1 })}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasMore || loading}
          className="px-4 py-2 rounded-xl border border-[rgb(var(--border))] text-xs font-bold disabled:opacity-40"
        >
          {t('next')}
        </button>
      </div>
    </div>
  );
};
