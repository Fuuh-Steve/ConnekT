'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, CreditCard, Activity, User, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { CountUp } from '../components/CountUp';
import { AdminStatProps } from '../types';
import { supabase } from '../lib/supabase';

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
        setError(`Unable to load admin metrics. ${message || 'Please check Supabase permissions or network connectivity.'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminMetrics();
  }, []);

  const stats = [
    { icon: <User className="w-5 h-5" />, label: 'Total Users', value: totalUsers, color: 'text-blue-500', delay: 0.1 },
    { icon: <Briefcase className="w-5 h-5" />, label: 'Active Jobs', value: jobCount, color: 'text-indigo-500', delay: 0.2 },
    { icon: <CreditCard className="w-5 h-5" />, label: 'Recruiter Accounts', value: recruiterCount, color: 'text-emerald-500', delay: 0.3 },
    { icon: <Activity className="w-5 h-5" />, label: 'Student Accounts', value: studentCount, color: 'text-purple-500', delay: 0.4 },
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
            Admin Overview
          </h1>
          <p className="text-[rgb(var(--text-muted))] text-sm">Monitor platform activity, manage access levels, and review account growth.</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 px-4 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Platform Status: Healthy
        </motion.div>
      </div>

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
              <h2 className="text-lg font-bold text-[rgb(var(--text-main))]">Recent Recruiter Signups</h2>
              <p className="text-xs text-[rgb(var(--text-muted))] font-medium uppercase tracking-wider">Newest company accounts</p>
            </div>
            <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 text-[10px] px-2 py-1 rounded-lg font-bold uppercase tracking-wider shadow-sm">Live data</span>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-side))] p-6 text-center text-sm text-[rgb(var(--text-muted))]">Loading recruiter data...</div>
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
                          {recruiter.full_name || recruiter.email || 'Recruiter account'}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest text-[rgb(var(--text-muted))]">
                          {recruiter.company_name || 'Company not provided'}
                        </p>
                      </div>
                      <p className="text-[10px] text-[rgb(var(--text-muted))] uppercase tracking-wider">
                        {recruiter.updated_at ? new Date(recruiter.updated_at).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-side))] p-6 text-center text-sm text-[rgb(var(--text-muted))]">
                  No recruiter activity detected yet.
                </div>
              )}
            </div>
          )}
        </section>

        <section className="lg:col-span-3 space-y-6">
          <div className="space-y-1 border-l-4 border-purple-400 pl-4">
            <h2 className="text-lg font-bold text-[rgb(var(--text-main))]">Latest Job Listings</h2>
            <p className="text-xs text-[rgb(var(--text-muted))] font-medium uppercase tracking-wider">Most recent roles posted</p>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-side))] p-6 text-center text-sm text-[rgb(var(--text-muted))]">Loading latest roles...</div>
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
                      <h3 className="font-bold text-[rgb(var(--text-main))] truncate">{job.title || 'Untitled role'}</h3>
                      <span className="text-[10px] uppercase tracking-wider text-[rgb(var(--text-muted))]">
                        {job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                    <p className="text-sm text-[rgb(var(--text-muted))] truncate">{job.company || 'Unknown company'}</p>
                    <p className="text-[10px] uppercase tracking-tight text-[rgb(var(--text-muted))]">
                      {job.location || 'Remote / unspecified'}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-[rgb(var(--text-muted))]">No jobs have been posted yet.</div>
              )}
            </div>
          )}
        </section>
      </div>
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
