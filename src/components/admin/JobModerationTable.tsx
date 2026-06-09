'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { AdminJobRow } from '../../types';

const PAGE_SIZE = 10;

export const JobModerationTable = () => {
  const t = useTranslations('admin.jobs');
  const [jobs, setJobs] = useState<AdminJobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select('id, title, company, location, posted_date, recruiter_id')
        .order('posted_date', { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

      if (fetchError) throw fetchError;

      const rows = data ?? [];
      setHasMore(rows.length > PAGE_SIZE);
      setJobs(rows.slice(0, PAGE_SIZE));
    } catch (err) {
      console.error('Failed to load jobs', err);
      setError(err instanceof Error ? err.message : t('errorFallback'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('confirmDelete'))) return;
    setActioningId(id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/admin/jobs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || t('actionFailed'));
      }
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      console.error('Failed to delete job', err);
      setError(err instanceof Error ? err.message : t('actionFailed'));
    } finally {
      setActioningId(null);
    }
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
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between p-5 border-b last:border-b-0 border-[rgb(var(--border))]"
              >
                <div className="min-w-0">
                  <h3 className="font-bold text-[rgb(var(--text-main))] truncate">{job.title || t('fallbackTitle')}</h3>
                  <p className="text-sm text-[rgb(var(--text-muted))] truncate">{job.company || t('fallbackCompany')}</p>
                  <p className="text-[10px] uppercase tracking-tight text-[rgb(var(--text-muted))] mt-1">
                    {job.location || t('fallbackLocation')}
                    {job.posted_date && ` • ${new Date(job.posted_date).toLocaleDateString()}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(job.id)}
                  disabled={actioningId === job.id}
                  className="self-start sm:self-center p-2.5 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  aria-label={t('deleteAriaLabel')}
                >
                  {actioningId === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
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
