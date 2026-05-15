'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Briefcase, User, Zap, ChevronRight, TrendingUp, CheckCircle, Search, Clock, MapPin, Building2, ExternalLink, X, Mail, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { CountUp } from '../components/CountUp';
import { UserProfile, Application, JobListing, StatCardProps } from '../types';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApplications = applications.filter(app => {
    const role = app.role?.toLowerCase() || '';
    const company = app.company?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return role.includes(query) || company.includes(query);
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      setLoading(true);
      
      // Set a timeout to ensure loading doesn't stay forever
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 10000); // 10 seconds timeout
      
      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) setProfile(profileData);

        // Fetch applications for THIS student
        const { data: appsData } = await supabase
          .from('applications')
          .select(`
            *,
            jobs (*)
          `)
          .eq('student_id', user.id)
          .order('created_at', { ascending: false });

        if (appsData) {
          setApplications(appsData.map(app => ({
            id: app.id,
            role: app.jobs?.title, // Fixed to use title
            company: app.jobs?.company,
            logo: app.jobs?.logo,
            location: app.jobs?.location,
            status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
            progress: app.status === 'Accepted' ? 100 : app.status === 'Interview' ? 60 : app.status === 'Reviewed' ? 40 : 20,
            appliedDate: new Date(app.created_at).toLocaleDateString()
          })));
        }

        // Fetch recommended jobs
        const { data: jobsData } = await supabase
          .from('jobs')
          .select('*')
          .limit(3);

        if (jobsData) {
          setRecommendedJobs(jobsData.map(job => ({
            ...job,
            matchScore: 85 + Math.floor(Math.random() * 15) // Temporary logic
          })));
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-[rgb(var(--accent))] animate-spin" />
        <p className="text-[rgb(var(--text-muted))] font-bold uppercase tracking-widest text-xs">Loading Dashboard...</p>
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Member';

  // Calculate Profile Strength
  const calculateProfileStrength = () => {
    if (!profile) return 0;
    let score = 0;
    const totalFields = 10;
    
    if (profile.full_name) score++;
    if (profile.bio) score++;
    if (profile.location) score++;
    if (profile.avatar_url) score++;
    if (profile.experience && profile.experience.length > 0) score++;
    if (profile.education && profile.education.length > 0) score++;
    if (profile.skills && profile.skills.length > 0) score++;
    if (profile.github_url || profile.linkedin_url) score++;
    if (profile.username) score++;
    if (profile.email) score++;
    
    return Math.round((score / totalFields) * 100);
  };

  // Calculate Interview Rate
  const calculateInterviewRate = () => {
    if (applications.length === 0) return 0;
    const positiveStatus = applications.filter(app => 
      ['Accepted', 'Interview'].includes(app.status)
    ).length;
    return Math.round((positiveStatus / applications.length) * 100);
  };

  const profileStrength = calculateProfileStrength();
  const interviewRate = calculateInterviewRate();

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <p className="text-sm font-semibold text-[rgb(var(--accent))]">Overview</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[rgb(var(--text-main))]">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-[rgb(var(--text-muted))]">Here&apos;s what&apos;s happening with your applications today.</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Link href="/jobs" className="px-6 py-3 bg-[rgb(var(--accent))] text-white font-bold rounded-xl hover:bg-[rgb(var(--accent))]/90 transition-all flex items-center gap-2 shadow-lg shadow-[rgb(var(--accent))]/20">
            <Search className="w-4 h-4" />
            <span>Explore Jobs</span>
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          icon={<Briefcase className="w-5 h-5 text-blue-500" />}
          label="Applications Sent"
          value={applications.length}
          trend={`${applications.length === 0 ? 'Start applying!' : 'Active tracker'}`}
          trendColor="text-blue-500"
          delay={0.1}
          tooltip="Total number of roles you've applied for."
        />
        <StatCard 
          icon={<Zap className="w-5 h-5 text-amber-500" />}
          label="Interview Rate"
          value={interviewRate}
          suffix="%"
          trend={interviewRate > 20 ? "Above average" : "Keep improving"}
          trendColor="text-amber-500"
          delay={0.2}
          tooltip="Percentage of applications moving to interview stages."
        />
        <StatCard 
          icon={<CheckCircle className="w-5 h-5 text-emerald-500" />}
          label="Profile Strength"
          value={profileStrength}
          suffix="%"
          trend={`${profileStrength}% complete`}
          trendColor="text-emerald-500"
          delay={0.3}
          tooltip="Based on your profile completeness and verified skills."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-bold">Recent Applications</h2>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[rgb(var(--text-muted))] group-focus-within:text-[rgb(var(--accent))] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl text-xs focus:outline-none focus:border-[rgb(var(--accent))] w-full sm:w-48 transition-all"
                />
              </div>
              <Link href="/applications" className="text-sm font-semibold text-[rgb(var(--accent))] hover:underline whitespace-nowrap">
                View All
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {filteredApplications.length > 0 ? filteredApplications.map((app, i) => (
              <motion.div 
                key={app.id} 
                className="block"
                onClick={() => setSelectedApp(app)}
              >
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[rgb(var(--bg-main))] p-5 rounded-2xl border border-[rgb(var(--border))] flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-[rgb(var(--accent))]/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-12 h-12 rounded-xl bg-[rgb(var(--bg-side))] p-2 border border-[rgb(var(--border))] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Image 
                        src={app.logo} 
                        alt={app.company} 
                        width={48}
                        height={48}
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-base leading-tight group-hover:text-[rgb(var(--accent))] transition-colors">{app.role}</h4>
                      <p className="text-[13px] text-[rgb(var(--text-muted))] font-bold mt-1 tracking-tight">{app.company} • {app.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-[rgb(var(--border))]">
                    <div className="text-right">
                      <span className={cn(
                        "text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2 inline-block border",
                        app.status === 'Accepted' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                        app.status === 'Interview' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                        'bg-slate-100 dark:bg-slate-800 text-[rgb(var(--text-muted))] border-[rgb(var(--border))]'
                      )}>
                        {app.status}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-[rgb(var(--bg-side))] rounded-full overflow-hidden border border-[rgb(var(--border))]">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${app.progress}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="h-full bg-[rgb(var(--accent))]" 
                          />
                        </div>
                        <span className="text-[12px] font-bold text-[rgb(var(--text-muted))]">{app.progress}%</span>
                      </div>
                    </div>
                    <div className="block">
                      <ChevronRight className="w-5 h-5 text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--accent))] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )) : (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-[rgb(var(--border))]">
                <Clock className="w-10 h-10 text-[rgb(var(--text-muted))] mx-auto mb-3 opacity-20" />
                <p className="text-sm font-bold text-[rgb(var(--text-muted))]">No recent applications found.</p>
                <Link href="/jobs" className="text-xs font-bold text-[rgb(var(--accent))] hover:underline mt-2 inline-block uppercase tracking-widest">Explore Jobs</Link>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-xl font-bold">Recommended for You</h2>

          <div className="space-y-4">
            {recommendedJobs.length > 0 ? recommendedJobs.map((job, i) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="block">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="bg-[rgb(var(--bg-side))] p-5 rounded-2xl border border-[rgb(var(--border))] flex flex-col gap-4 hover:border-[rgb(var(--accent))]/30 transition-all group relative"
                >
                  <div className="absolute top-4 right-4 text-[10px] font-bold text-[rgb(var(--accent))]">
                    {job.matchScore}% Match
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white p-2 border border-[rgb(var(--border))] group-hover:scale-105 transition-transform">
                      <Image 
                        src={job.logo} 
                        alt={job.company} 
                        width={48}
                        height={48}
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-base leading-tight group-hover:text-[rgb(var(--accent))] transition-colors">{job.title}</h4>
                      <p className="text-xs text-[rgb(var(--text-muted))] font-medium">{job.company}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {job.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] font-medium px-2 py-1 rounded-lg bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] text-[rgb(var(--text-muted))]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="w-full py-2.5 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-xl text-xs font-bold hover:bg-[rgb(var(--accent))] hover:text-white hover:border-transparent transition-all shadow-sm text-center">
                     View Details
                  </div>
                </motion.div>
              </Link>
            )) : null}
          </div>
        </div>
      </div>

      {/* Application Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[rgb(var(--bg-main))] rounded-[2.5rem] shadow-2xl border border-[rgb(var(--border))] overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]"
            >
              <div className="p-5 sm:p-8 flex items-start justify-between border-b border-[rgb(var(--border))] shrink-0">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[rgb(var(--bg-side))] p-2 sm:p-3 border border-[rgb(var(--border))] flex items-center justify-center shrink-0">
                    <Image 
                      src={selectedApp.logo} 
                      alt={selectedApp.company} 
                      width={64}
                      height={64}
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">{selectedApp.role}</h3>
                    <p className="font-bold text-[rgb(var(--accent))] tracking-wide uppercase text-[10px] sm:text-xs mt-1">{selectedApp.company}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedApp(null)}
                  aria-label="Close application details"
                  className="p-2 rounded-xl bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-main))] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 sm:p-8 overflow-y-auto space-y-6 sm:space-y-8 flex-1 scrollbar-hide">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[rgb(var(--text-muted))]">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Applied</span>
                    </div>
                    <p className="text-sm font-bold">{selectedApp.appliedDate}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[rgb(var(--text-muted))]">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Location</span>
                    </div>
                    <p className="text-sm font-bold truncate">{selectedApp.location}</p>
                  </div>
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-2 text-[rgb(var(--text-muted))]">
                   <TrendingUp className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Status</span>
                    </div>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{selectedApp.status}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-[11px] uppercase tracking-widest text-[rgb(var(--text-muted))]">Current Stage</h4>
                  <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 flex items-start gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-950 dark:text-blue-100">Reviewing Screening Test</p>
                      <p className="text-[12px] text-blue-700 dark:text-blue-300 mt-1 font-medium leading-relaxed">
                        The team is currently reviewing your profile and test results.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-[11px] uppercase tracking-widest text-[rgb(var(--text-muted))]">Next Milestone</h4>
                  <div className="space-y-3">
                    {[
                      { step: 'Technical Interview', status: 'pending' },
                      { step: 'Culture Fit', status: 'locked' },
                      { step: 'Final Offer', status: 'locked' }
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-center gap-3 opacity-60">
                        <div className="w-2 h-2 rounded-full bg-[rgb(var(--border))]" />
                        <span className="text-sm font-medium">{step.step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 sticky bottom-0 bg-[rgb(var(--bg-main))] py-4 -mx-5 px-5 sm:-mx-8 sm:px-8 border-t border-[rgb(var(--border))] shrink-0">
                  <button 
                    onClick={() => setSelectedApp(null)}
                    className="flex-1 py-3 sm:py-4 bg-[rgb(var(--accent))] text-white font-bold rounded-xl sm:rounded-2xl shadow-xl shadow-[rgb(var(--accent))]/20 hover:bg-[rgb(var(--accent))]/90 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Got it</span>
                  </button>
                  <button className="flex-1 py-3 sm:py-4 bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] text-[rgb(var(--text-main))] font-bold rounded-xl sm:rounded-2xl hover:bg-[rgb(var(--border))]/30 transition-all flex items-center justify-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>View Company</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ icon, label, value, suffix = '', trend, trendColor, delay, tooltip }: StatCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    title={tooltip}
    className="bg-[rgb(var(--bg-main))] p-6 rounded-2xl border border-[rgb(var(--border))] flex items-center gap-4 hover:border-[rgb(var(--accent))]/40 transition-colors shadow-sm relative group/card"
  >
    <div className="w-12 h-12 bg-[rgb(var(--bg-side))] rounded-xl flex items-center justify-center border border-[rgb(var(--border))]">
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-1.5 mb-1">
        <p className="text-[13px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider">{label}</p>
        <span className="text-[10px] text-[rgb(var(--text-muted))] opacity-0 group-hover/card:opacity-100 transition-opacity cursor-help underline decoration-dotted">Info</span>
      </div>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold leading-none">
          <CountUp end={value} suffix={suffix} />
        </p>
        <p className={cn("text-[11px] font-bold mb-0.5", trendColor)}>
          {trend}
        </p>
      </div>
    </div>
  </motion.div>
);

