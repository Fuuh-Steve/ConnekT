'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ShieldCheck, CreditCard, Activity, User, Briefcase, LayoutGrid, Users, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { CountUp } from '../components/CountUp';
import { AdminStatProps } from '../types';
import { supabase } from '../lib/supabase';
import { UserManagementTable } from '../components/admin/UserManagementTable';
import { JobModerationTable } from '../components/admin/JobModerationTable';
import { ApplicationsOversightTable } from '../components/admin/ApplicationsOversightTable';

type AdminTab = 'overview' | 'users' | 'jobs' | 'applications';

type RecruiterProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  company_name: string | null;
  updated_at: string | null;
};

type JobSummary = {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  posted_date: string | null;
};

export const AdminDashboard = () => {
  const t = useTranslations('admin');
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [recruiterCount, setRecruiterCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);
  const [recentRecruiters, setRecentRecruiters] = useState<RecruiterProfile[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobSummary[]>([]);

  useEffect(() => {
    const fetchAdminMetrics = async () => {
      setLoading(true);
      setError(null);

      try {
        const [profilesCountRes, recruiterCountRes, jobsCountRes] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'recruiter'),
          supabase.from('jobs').select('*', { count: 'exact', head: true }),
        ]);

        if (profilesCountRes.error || recruiterCountRes.error || jobsCountRes.error) {
          throw profilesCountRes.error || recruiterCountRes.error || jobsCountRes.error;
        }

        const totalUsersCount = profilesCountRes.count ?? 0;
        const recruiterAccounts = recruiterCountRes.count ?? 0;

        setTotalUsers(totalUsersCount);
        setRecruiterCount(recruiterAccounts);
        setStudentCount(Math.max(0, totalUsersCount - recruiterAccounts));
        setJobCount(jobsCountRes.count ?? 0);

        const recentRecruitersRes = await supabase
          .from('profiles')
          .select('id, full_name, email, company_name, updated_at')
          .eq('role', 'recruiter')
          .order('updated_at', { ascending: false })
          .limit(4);

        const recentJobsRes = await supabase
          .from('jobs')
          .select('id, title, company, location, posted_date')
          .order('posted_date', { ascending: false })
          .limit(4);

        if (recentRecruitersRes.error || recentJobsRes.error) {
          throw recentRecruitersRes.error || recentJobsRes.error;
        }

        setRecentRecruiters(recentRecruitersRes.data ?? []);
        setRecentJobs(recentJobsRes.data ?? []);
      } catch (err) {
        console.error('Admin dashboard load failed', err);
        const message = err instanceof Error ? err.message : JSON.stringify(err, null, 2);
        setError(`${t('errorPrefix')} ${message || t('errorFallback')}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminMetrics();
  }, []);

  const stats = [
    { icon: <User className="w-5 h-5" />, label: t('stats.totalUsers'), value: totalUsers, color: 'text-blue-500', delay: 0.1 },
    { icon: <Briefcase className="w-5 h-5" />, label: t('stats.activeJobs'), value: jobCount, color: 'text-indigo-500', delay: 0.2 },
    { icon: <CreditCard className="w-5 h-5" />, label: t('stats.recruiterAccounts'), value: recruiterCount, color: 'text-emerald-500', delay: 0.3 },
    { icon: <Activity className="w-5 h-5" />, label: t('stats.studentAccounts'), value: studentCount, color: 'text-purple-500', delay: 0.4 },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-bold tracking-tight text-[rgb(var(--text-main))] flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[rgb(var(--accent))]" />
            {t('title')}
          </h1>
          <p className="text-[rgb(var(--text-muted))] text-sm">{t('subtitle')}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 px-4 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {t('platformStatus')}
        </motion.div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[rgb(var(--border))] pb-2">
        {([
          { id: 'overview', label: t('tabs.overview'), icon: <LayoutGrid className="w-4 h-4" /> },
          { id: 'users', label: t('tabs.users'), icon: <Users className="w-4 h-4" /> },
          { id: 'jobs', label: t('tabs.jobs'), icon: <Briefcase className="w-4 h-4" /> },
          { id: 'applications', label: t('tabs.applications'), icon: <Inbox className="w-4 h-4" /> },
        ] as { id: AdminTab; label: string; icon: React.ReactNode }[]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all',
              activeTab === tab.id
                ? 'bg-[rgb(var(--accent))] text-white shadow-sm'
                : 'text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-side))]'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <AdminStat
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            color={stat.color}
            delay={stat.delay}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-10">
        <section className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between border-l-4 border-amber-400 pl-4">
            <div>
              <h2 className="text-lg font-bold text-[rgb(var(--text-main))]">{t('recruiterSignups.heading')}</h2>
              <p className="text-xs text-[rgb(var(--text-muted))] font-medium uppercase tracking-wider">{t('recruiterSignups.subheading')}</p>
            </div>
            <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 text-[10px] px-2 py-1 rounded-lg font-bold uppercase tracking-wider shadow-sm">{t('recruiterSignups.liveData')}</span>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-side))] p-6 text-center text-sm text-[rgb(var(--text-muted))]">{t('recruiterSignups.loading')}</div>
          ) : (
            <div className="space-y-3">
              {recentRecruiters.length > 0 ? (
                recentRecruiters.map((recruiter) => (
                  <motion.div
                    key={recruiter.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-[rgb(var(--bg-main))] p-5 rounded-xl border border-[rgb(var(--border))] shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-[rgb(var(--text-main))]">
                          {recruiter.full_name || recruiter.email || t('recruiterSignups.fallbackName')}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest text-[rgb(var(--text-muted))]">
                          {recruiter.company_name || t('recruiterSignups.fallbackCompany')}
                        </p>
                      </div>
                      <p className="text-[10px] text-[rgb(var(--text-muted))] uppercase tracking-wider">
                        {recruiter.updated_at ? new Date(recruiter.updated_at).toLocaleDateString() : t('recruiterSignups.unknownDate')}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-side))] p-6 text-center text-sm text-[rgb(var(--text-muted))]">
                  {t('recruiterSignups.empty')}
                </div>
              )}
            </div>
          )}
        </section>

        <section className="lg:col-span-3 space-y-6">
          <div className="space-y-1 border-l-4 border-purple-400 pl-4">
            <h2 className="text-lg font-bold text-[rgb(var(--text-main))]">{t('jobListings.heading')}</h2>
            <p className="text-xs text-[rgb(var(--text-muted))] font-medium uppercase tracking-wider">{t('jobListings.subheading')}</p>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-side))] p-6 text-center text-sm text-[rgb(var(--text-muted))]">{t('jobListings.loading')}</div>
          ) : (
            <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-main))] overflow-hidden shadow-sm">
              {recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col gap-2 p-5 border-b last:border-b-0 border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-side))] transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-bold text-[rgb(var(--text-main))] truncate">{job.title || t('jobListings.fallbackTitle')}</h3>
                      <span className="text-[10px] uppercase tracking-wider text-[rgb(var(--text-muted))]">
                        {job.posted_date ? new Date(job.posted_date).toLocaleDateString() : t('jobListings.unknownDate')}
                      </span>
                    </div>
                    <p className="text-sm text-[rgb(var(--text-muted))] truncate">{job.company || t('jobListings.fallbackCompany')}</p>
                    <p className="text-[10px] uppercase tracking-tight text-[rgb(var(--text-muted))]">
                      {job.location || t('jobListings.fallbackLocation')}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-[rgb(var(--text-muted))]">{t('jobListings.empty')}</div>
              )}
            </div>
          )}
        </section>
      </div>
        </>
      )}

      {activeTab === 'users' && <UserManagementTable />}
      {activeTab === 'jobs' && <JobModerationTable />}
      {activeTab === 'applications' && <ApplicationsOversightTable />}
    </div>
  );
};

const AdminStat = ({ icon, label, value, color, delay, prefix = '', suffix = '' }: AdminStatProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="bg-[rgb(var(--bg-main))] p-6 rounded-2xl border border-[rgb(var(--border))] group hover:border-[rgb(var(--accent))]/40 transition-all shadow-sm"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={cn('p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 transition-transform group-hover:scale-110', color)}>
        {icon}
      </div>
      <div className="h-1 w-10 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: '70%' }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: delay + 0.3 }}
          className={cn('h-full bg-current opacity-50', color)}
        />
      </div>
    </div>
    <p className="text-[rgb(var(--text-muted))] text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-bold tracking-tight text-[rgb(var(--text-main))]">
      <CountUp end={value} prefix={prefix} suffix={suffix} />
    </p>
  </motion.div>
);
