'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { AdminProfileRow, UserRole } from '../../types';

const PAGE_SIZE = 10;
const ROLE_OPTIONS: UserRole[] = ['student', 'recruiter', 'admin'];

export const UserManagementTable = () => {
  const t = useTranslations('admin.users');
  const [profiles, setProfiles] = useState<AdminProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('profiles')
        .select('id, full_name, email, role, company_name, university, updated_at')
        .order('updated_at', { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }
      if (search.trim()) {
        query = query.or(`full_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      const rows = data ?? [];
      setHasMore(rows.length > PAGE_SIZE);
      setProfiles(rows.slice(0, PAGE_SIZE));
    } catch (err) {
      console.error('Failed to load users', err);
      setError(err instanceof Error ? err.message : t('errorFallback'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, roleFilter]);

  useEffect(() => {
    setPage(0);
    const handle = setTimeout(() => fetchProfiles(), 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const callAdminApi = async (path: string, init: RequestInit) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(path, {
      ...init,
      headers: {
        ...(init.headers || {}),
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token ?? ''}`,
      },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || t('actionFailed'));
    }
  };

  const handleRoleChange = async (id: string, role: UserRole) => {
    setActioningId(id);
    try {
      await callAdminApi(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, role } : p)));
    } catch (err) {
      console.error('Failed to update role', err);
      setError(err instanceof Error ? err.message : t('actionFailed'));
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('confirmDelete'))) return;
    setActioningId(id);
    try {
      await callAdminApi(`/api/admin/users/${id}`, { method: 'DELETE' });
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete user', err);
      setError(err instanceof Error ? err.message : t('actionFailed'));
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-muted))]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-[rgb(var(--accent))] focus:ring-4 focus:ring-[rgb(var(--accent))]/5 transition-all shadow-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)}
          className="bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-xl py-2.5 px-4 text-sm font-bold focus:outline-none focus:border-[rgb(var(--accent))] shadow-sm"
        >
          <option value="all">{t('roleFilter.all')}</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>{t(`roleFilter.${r}`)}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-side))] p-6 text-center text-sm text-[rgb(var(--text-muted))]">{t('loading')}</div>
      ) : (
        <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-main))] overflow-hidden shadow-sm">
          {profiles.length > 0 ? (
            profiles.map((profile) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between p-5 border-b last:border-b-0 border-[rgb(var(--border))]"
              >
                <div className="min-w-0">
                  <p className="font-bold text-[rgb(var(--text-main))] truncate">
                    {profile.full_name || t('unnamed')}
                  </p>
                  <p className="text-xs text-[rgb(var(--text-muted))] truncate">{profile.email || '—'}</p>
                  {(profile.company_name || profile.university) && (
                    <p className="text-[10px] uppercase tracking-widest text-[rgb(var(--text-muted))] mt-1">
                      {profile.company_name || profile.university}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={profile.role}
                    disabled={actioningId === profile.id}
                    onChange={(e) => handleRoleChange(profile.id, e.target.value as UserRole)}
                    className="bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-lg py-2 px-3 text-xs font-bold focus:outline-none focus:border-[rgb(var(--accent))] disabled:opacity-50"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>{t(`roleFilter.${r}`)}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDelete(profile.id)}
                    disabled={actioningId === profile.id}
                    className="p-2.5 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                    aria-label={t('deleteAriaLabel')}
                  >
                    {actioningId === profile.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
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
