'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, ChevronRight, Clock, MapPin, Search, ListFilter, ArrowLeft, CheckCircle, X, ShieldCheck, Mail, Building2, TrendingUp, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export const ApplicationsPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            jobs (*)
          `)
          .eq('student_id', user.id);

        if (error) {
          console.error('Error fetching applications:', error);
        } else if (data) {
          const transformedApps = data.map(app => ({
            id: app.id,
            role: app.jobs?.title || 'Unknown Role',
            company: app.jobs?.company || 'Unknown Company',
            logo: app.jobs?.logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop',
            location: app.jobs?.location || 'Remote',
            status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
            progress: app.status === 'Accepted' ? 100 : app.status === 'Interview' ? 60 : app.status === 'Reviewed' ? 40 : 20,
            appliedDate: new Date(app.created_at).toLocaleDateString(),
            desc: app.jobs?.description || 'No description available'
          }));
          setApplications(transformedApps);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  const filteredApps = applications.filter(app => 
    app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-[rgb(var(--accent))] animate-spin" />
        <p className="text-[rgb(var(--text-muted))] font-bold uppercase tracking-widest text-xs">Loading Applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-bold text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Your Applications</h1>
            <p className="text-[rgb(var(--text-muted))] text-sm">Track and manage all your internship submissions.</p>
          </div>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-muted))]" />
          <input 
            type="text" 
            placeholder="Search applications..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-[rgb(var(--accent))] focus:ring-4 focus:ring-[rgb(var(--accent))]/5 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredApps.length > 0 ? (
          filteredApps.map((app, i) => (
            <motion.div 
              key={app.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedApp(app)}
              className="bg-[rgb(var(--bg-main))] p-5 rounded-2xl border border-[rgb(var(--border))] flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-[rgb(var(--accent))]/50 transition-all cursor-pointer group hover:shadow-lg hover:shadow-[rgb(var(--accent))]/5"
            >
              <div className="flex items-center gap-5 w-full sm:w-auto">
                <div className="w-14 h-14 rounded-2xl bg-[rgb(var(--bg-side))] p-2.5 border border-[rgb(var(--border))] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Image 
                    src={app.logo} 
                    alt={app.company} 
                    width={56}
                    height={56}
                    className="w-full h-full object-contain" 
                  />
                </div>
                <div>
                  <h4 className="font-bold text-lg leading-tight group-hover:text-[rgb(var(--accent))] transition-colors">{app.role}</h4>
                  <div className="flex items-center gap-2 mt-1.5 font-bold text-[rgb(var(--text-muted))] text-xs uppercase tracking-tight">
                    <span>{app.company}</span>
                    <span className="opacity-30">•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {app.location}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-[rgb(var(--border))]">
                <div className="space-y-2 text-right hidden md:block">
                  <p className="text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-widest leading-none">Applied</p>
                  <p className="text-xs font-bold leading-none">{app.appliedDate}</p>
                </div>

                <div className="flex-1 sm:flex-none text-right">
                  <span className={cn(
                    "text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-2 inline-block border",
                    app.status === 'Accepted' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                    app.status === 'Interview' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                    'bg-slate-100 dark:bg-slate-800 text-[rgb(var(--text-muted))] border-[rgb(var(--border))]'
                  )}>
                    {app.status}
                  </span>
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-24 h-1.5 bg-[rgb(var(--bg-side))] rounded-full overflow-hidden border border-[rgb(var(--border))]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${app.progress}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full bg-[rgb(var(--accent))]" 
                      />
                    </div>
                    <span className="text-[12px] font-bold text-[rgb(var(--text-muted))] min-w-[30px]">{app.progress}%</span>
                  </div>
                </div>
                
                <div className="p-2 rounded-xl bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] group-hover:bg-[rgb(var(--accent))] group-hover:text-white group-hover:border-transparent transition-all">
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-[rgb(var(--bg-main))] rounded-[2.5rem] border border-[rgb(var(--border))] border-dashed">
            <div className="w-20 h-20 bg-[rgb(var(--bg-side))] rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-[rgb(var(--text-muted))] opacity-20" />
            </div>
            <h3 className="text-xl font-bold">No applications found</h3>
            <p className="text-[rgb(var(--text-muted))] text-sm mt-2">Try adjusting your search query.</p>
          </div>
        )}
      </div>

      {/* Application Detail Modal - Shared logic with Dashboard but consistent here */}
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
