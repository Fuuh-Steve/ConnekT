'use client';

import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, ChevronRight, Search, Users, Briefcase, User, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { CountUp } from '../components/CountUp';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const RecruiterDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const normalizeStatus = (status?: string | null) => {
    const value = status?.toString().trim().toLowerCase() || 'pending';
    switch (value) {
      case 'pending':
        return 'Pending';
      case 'reviewed':
        return 'Reviewed';
      case 'interview':
        return 'Interview';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      default:
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending';
    }
  };

  const fetchDashboardData = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch recruiter's jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('recruiter_id', user.id);

      setJobs(jobsData || []);

      // Fetch applications for these jobs
      if (jobsData && jobsData.length > 0) {
        const jobIds = jobsData.map(j => j.id);
        const { data: appsData, error: appsError } = await supabase
          .from('applications')
          .select('id, job_id, student_id, status, created_at')
          .in('job_id', jobIds)
          .order('created_at', { ascending: false });

        if (appsError) {
          console.error('Error fetching applications:', appsError);
          throw appsError;
        }

        console.log('Raw applications data:', appsData);

        // Filter out applications with invalid student_ids
        const validApps = (appsData || []).filter((app: any) => app.student_id && typeof app.student_id === 'string');
        console.log('Valid applications:', validApps.length);

        const applicationsWithDetails = validApps.map((app: any) => {
          const job = jobsData.find((job: any) => job.id === app.job_id);

          return {
            ...app,
            status: normalizeStatus(app.status),
            profiles: { full_name: 'Applicant', avatar_url: null, university: 'Loading...' },
            jobs: job || { title: 'Unknown Job', company: 'Unknown Company' }
          };
        });

        setApplications(applicationsWithDetails);

        // Fetch profiles separately (optional - dashboard works without them)
        const studentIds = [...new Set(validApps.map((app: any) => app.student_id).filter(id => {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          return uuidRegex.test(id);
        }))];

        if (studentIds.length > 0) {
          // Delay profile fetching to not block the UI
          setTimeout(async () => {
            try {
              const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, university')
                .in('id', studentIds);

              if (!profilesError && profilesData) {
                const profileMap = profilesData.reduce((acc: any, profile: any) => {
                  acc[profile.id] = profile;
                  return acc;
                }, {});

                setApplications(prev => prev.map(app => ({
                  ...app,
                  profiles: profileMap[app.student_id] || { full_name: 'Unknown Applicant', avatar_url: null, university: 'Not specified' }
                })));
              }
            } catch (err) {
              // Silently fail - profiles are optional
              console.log('Profile fetching failed, using placeholders');
            }
          }, 1000);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

useEffect(() => {
  fetchDashboardData();
}, [fetchDashboardData]);

const filteredApplications = applications.filter(app => {
  const fullName = app.profiles?.full_name?.toLowerCase() || '';
  const jobTitle = app.jobs?.title?.toLowerCase() || '';
  const query = searchQuery.toLowerCase();
  return fullName.includes(query) || jobTitle.includes(query);
});

if (loading) {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-[rgb(var(--accent))] animate-spin" />
      <p className="text-[rgb(var(--text-muted))] font-bold uppercase tracking-widest text-xs">Loading Talent Portal...</p>
    </div>
  );
}

return (
  <div className="space-y-16 pb-32 px-2 md:px-6">
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] text-[10px] font-bold uppercase tracking-widest rounded-full border border-[rgb(var(--accent))]/20">
            Recruiter Account
          </span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[rgb(var(--text-main))] mb-2">TALENT PORTAL</h1>
          <p className="text-[rgb(var(--text-muted))] text-lg font-medium max-w-2xl leading-relaxed">Review incoming applications, optimize your listings, and build your dream team with AI-powered analytics.</p>
        </div>
      </motion.div>
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => router.push('/post')}
        className="px-10 py-5 bg-[rgb(var(--accent))] text-white font-bold uppercase tracking-widest rounded-4xl hover:bg-[rgb(var(--accent))]/90 transition-all flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(var(--accent),0.2)] hover:scale-[1.05] active:scale-95 group">
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
        <span>New Job Posting</span>
      </motion.button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
      <QuickStat
        label="Active Postings"
        value={jobs.length}
        prefix=""
        subValue={`${jobs.length > 0 ? 'Managing active roles' : 'No active roles'}`}
        icon={Briefcase}
        delay={0.1}
        onClick={() => router.push('/listings')}
      />
      <QuickStat
        label="Total Applications"
        value={applications.length}
        subValue="Incoming talent"
        icon={Users}
        highlight
        delay={0.2}
        onClick={() => { }}
      />
      <QuickStat
        label="Avg. Match Score"
        value={84}
        suffix="%"
        subValue="Highly compatible"
        icon={Search}
        delay={0.3}
        onClick={() => { }}
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <section className="space-y-8">
        <h3 className="text-2xl font-extrabold uppercase tracking-widest flex items-center gap-3">
          <CheckCircle className="w-7 h-7 text-emerald-500" />
          Scheduled Interviews
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              onClick={() => typeof window !== 'undefined' && window.open('https://meet.google.com', '_blank')}
              className="p-6 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-[2.5rem] hover:border-[rgb(var(--accent))]/60 transition-all cursor-pointer group shadow-sm hover:shadow-2xl hover:shadow-[rgb(var(--accent))]/10"
            >
              <div className="flex items-center gap-5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[rgb(var(--bg-side))] flex items-center justify-center border border-[rgb(var(--border))] group-hover:scale-105 transition-transform shadow-sm">
                  <User className="w-6 h-6 text-[rgb(var(--text-muted))]" />
                </div>
                <div>
                  <p className="text-lg font-bold group-hover:text-[rgb(var(--accent))] transition-colors tracking-tight">Jane Smith {i}</p>
                  <p className="text-[10px] text-[rgb(var(--text-muted))] uppercase font-bold tracking-widest opacity-80">Product Design Role</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-8">
                <div className="px-4 py-2 rounded-xl bg-[rgb(var(--bg-side))] text-[rgb(var(--accent))] text-[11px] font-bold tracking-widest uppercase border border-[rgb(var(--border))]">
                  Today, 14:00
                </div>
                <button className="text-[11px] font-bold text-[rgb(var(--accent))] underline underline-offset-8 uppercase tracking-widest group-hover:translate-x-2 transition-transform">Join Link</button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <h3 className="text-2xl font-extrabold uppercase tracking-widest">Global Activity</h3>
        <div className="relative space-y-12 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[3px] before:bg-[rgb(var(--border))]">
          {[
            { text: "New application received for Frontend React role", time: "2m ago", type: "new" },
            { text: "Shortlisted 5 candidates for Backend Node.js", time: "1h ago", type: "shortlist" },
            { text: "Job posting 'UI Intern' is closing tomorrow", time: "3h ago", type: "alert" }
          ].map((activity, i) => (
            <div
              key={i}
              className="relative pl-14 group cursor-pointer"
            >
              <div className={cn(
                "absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center border-4 border-[rgb(var(--bg-main))] z-10 transition-transform group-hover:scale-125 group-hover:rotate-12",
                activity.type === 'new' ? "bg-blue-500 shadow-xl shadow-blue-500/30" : activity.type === 'shortlist' ? "bg-emerald-500 shadow-xl shadow-emerald-500/30" : "bg-[rgb(var(--accent))] shadow-xl shadow-[rgb(var(--accent))]/30"
              )}>
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <p className="text-sm text-[rgb(var(--text-main))] font-bold leading-tight group-hover:text-[rgb(var(--accent))] transition-colors tracking-tight">{activity.text}</p>
              <p className="text-[11px] text-[rgb(var(--text-muted))] mt-2 font-bold uppercase tracking-widest opacity-70">{activity.time}</p>
            </div>
          ))}
        </div>
      </section>
    </div>

    <section className="space-y-12 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-4">
            <Users className="w-8 h-8 text-[rgb(var(--accent))]" />
            Recent Applications
          </h2>
          <p className="text-base text-[rgb(var(--text-muted))] mt-2 tracking-tight">Review your latest applicant matches and scores across all active job postings.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-muted))]" />
            <input
              type="text"
              placeholder="Search candidates or roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-2xl py-3.5 pl-12 pr-6 text-sm focus:outline-none focus:border-[rgb(var(--accent))] w-96 transition-all shadow-sm focus:ring-4 focus:ring-[rgb(var(--accent))]/5"
            />
          </div>
          <button
            onClick={() => router.push('/listings')}
            className="px-8 py-3.5 border border-[rgb(var(--border))] rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[rgb(var(--bg-side))] hover:border-[rgb(var(--accent))]/30 transition-all shadow-sm active:scale-95 flex items-center gap-3 group"
          >
            Manage All
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-[rgb(var(--bg-main))] rounded-[3rem] border border-[rgb(var(--border))] overflow-hidden shadow-2xl shadow-black/5"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[rgb(var(--bg-side))] border-b border-[rgb(var(--border))]">
                <th className="px-6 md:px-10 py-7 text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-[0.2em]">Candidate</th>
                <th className="px-10 py-7 text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-[0.2em] hidden lg:table-cell">Job Role</th>
                <th className="px-10 py-7 text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-[0.2em] text-center hidden md:table-cell">Match Score</th>
                <th className="px-10 py-7 text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-[0.2em] text-center hidden sm:table-cell">Status</th>
                <th className="px-6 md:px-10 py-7"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border))]">
              {filteredApplications.length > 0 ? filteredApplications.map((app, idx) => (
                <motion.tr
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => router.push(`/profile/${app.profiles?.username || app.student_id}`)}
                  className="hover:bg-[rgb(var(--accent))]/5 transition-all group cursor-pointer"
                >
                  <td className="px-6 md:px-10 py-8">
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shrink-0 overflow-hidden">
                        {app.profiles?.avatar_url ? (
                          <Image
                            src={app.profiles.avatar_url}
                            alt="Avatar"
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-[rgb(var(--text-muted))]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="block font-bold text-base md:text-lg text-[rgb(var(--text-main))] group-hover:text-[rgb(var(--accent))] transition-colors tracking-tight truncate">{app.profiles?.full_name || 'Candidate'}</span>
                        <span className="text-[9px] md:text-[10px] text-[rgb(var(--text-muted))] font-bold uppercase tracking-wider block truncate">{app.profiles?.university || 'Top Tier University'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 hidden lg:table-cell">
                    <span className="text-sm font-bold text-[rgb(var(--text-main))] opacity-90">{app.jobs?.title}</span>
                  </td>
                  <td className="px-10 py-8 hidden md:table-cell">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-sm font-bold text-[rgb(var(--accent))] tracking-tight">{80 + Math.floor(Math.random() * 20)}% MATCH</span>
                      <div className="w-28 h-2 bg-[rgb(var(--bg-side))] rounded-full overflow-hidden border border-[rgb(var(--border))]">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${80 + Math.floor(Math.random() * 20)}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full bg-[rgb(var(--accent))]"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center hidden sm:table-cell">
                    <span className={cn(
                      "px-4 md:px-5 py-2 rounded-2xl font-bold text-[9px] md:text-[10px] uppercase tracking-widest border",
                      app.status === 'Pending' ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                        app.status === 'Reviewed' ? "bg-purple-500/10 text-purple-600 border-purple-500/20" :
                          app.status === 'Interview' ? "bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] border-[rgb(var(--accent))]/20" :
                            app.status === 'Accepted' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                              app.status === 'Rejected' ? "bg-red-500/10 text-red-600 border-red-500/20" :
                                "bg-slate-100 dark:bg-slate-800 text-[rgb(var(--text-muted))] border-[rgb(var(--border))]"
                    )}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 md:px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-2 md:gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/applicants/${app.job_id}`); }}
                        className="px-3 md:px-4 py-2 bg-[rgb(var(--bg-side))] rounded-xl border border-[rgb(var(--border))] text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:border-[rgb(var(--accent))] transition-all whitespace-nowrap"
                      >
                        Pipeline
                      </button>
                      <div className="p-2 md:p-3 bg-[rgb(var(--bg-side))] rounded-2xl border border-[rgb(var(--border))] group-hover:bg-[rgb(var(--accent))] group-hover:text-white transition-all inline-block group-hover:px-4 md:group-hover:px-5 group-hover:shadow-lg group-hover:shadow-[rgb(var(--accent))]/30">
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                    </div>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-[rgb(var(--text-muted))] font-bold uppercase tracking-widest text-xs">
                    No applications found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </section>
  </div>
);
};

const QuickStat = ({ label, value, prefix = '', suffix = '', subValue, highlight, icon: Icon, delay, onClick }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    onClick={onClick}
    className={cn(
      "bg-[rgb(var(--bg-main))] p-8 rounded-[2.5rem] border border-[rgb(var(--border))] transition-all hover:shadow-2xl hover:-translate-y-1 group cursor-pointer relative overflow-hidden",
      highlight && "border-[rgb(var(--accent))]/30 shadow-xl shadow-[rgb(var(--accent))]/5"
    )}
  >
    {highlight && (
      <div className="absolute top-0 right-0 p-4">
        <div className="w-2 h-2 rounded-full bg-[rgb(var(--accent))] animate-ping"></div>
      </div>
    )}
    <div className="flex items-center gap-6 mb-8">
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3",
        highlight ? "bg-[rgb(var(--accent))] text-white shadow-xl shadow-[rgb(var(--accent))]/20" : "bg-[rgb(var(--bg-side))] text-[rgb(var(--text-muted))] border border-[rgb(var(--border))]"
      )}>
        <Icon className="w-7 h-7" />
      </div>
      <p className="text-[rgb(var(--text-muted))] text-xs font-bold uppercase tracking-[0.2em]">{label}</p>
    </div>
    <div className="flex items-end gap-3 mb-2">
      <div className="text-5xl font-extrabold leading-none tracking-tight">
        <CountUp end={value} prefix={prefix} suffix={suffix} />
      </div>
      <p className="text-xs text-[rgb(var(--text-muted))] font-bold mb-1 opacity-70 uppercase tracking-widest">{subValue}</p>
    </div>

    <div className="mt-6 h-2 w-full bg-[rgb(var(--bg-side))] rounded-full overflow-hidden border border-[rgb(var(--border))]">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: '66.6%' }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
        className={cn("h-full", highlight ? "bg-[rgb(var(--accent))]" : "bg-slate-400 dark:bg-slate-500")}
      />
    </div>
  </motion.div>
);

