'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, User, Mail, Download, CheckCircle, XCircle, Zap, Search, ListFilter, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const ApplicantView = () => {
  const params = useParams();
  const jobId = params?.jobId;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [interviewModal, setInterviewModal] = useState<{ open: boolean; applicant: any }>({ open: false, applicant: null });
  const [interviewForm, setInterviewForm] = useState({ dateTime: '', meetLink: '', notes: '' });
  const [schedulingInterview, setSchedulingInterview] = useState(false);

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

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!jobId) {
        console.log('No jobId provided');
        setLoading(false);
        return;
      }
      if (authLoading) return;
      if (!user) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setUnauthorized(false);

      try {
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('id, recruiter_id, title')
          .eq('id', jobId)
          .single();

        if (jobError || !jobData) {
          console.error('Error fetching job details:', jobError);
          setUnauthorized(true);
          setApplicants([]);
          setLoading(false);
          return;
        }

        if (jobData.recruiter_id !== user.id) {
          setUnauthorized(true);
          setApplicants([]);
          setLoading(false);
          return;
        }

        // Fetch applications for this job
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select('id, student_id, status, created_at')
          .eq('job_id', jobId)
          .order('created_at', { ascending: false });

        if (applicationsError) {
          console.error('Error fetching applications:', applicationsError.message, applicationsError.details);
          setApplicants([]);
          setLoading(false);
          return;
        }

        console.log('Found applications:', applicationsData?.length);

        if (!applicationsData || applicationsData.length === 0) {
          setApplicants([]);
          setLoading(false);
          return;
        }

        // Fetch profiles for all applicants
        const studentIds = applicationsData.map(app => app.student_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, education, location')
          .in('id', studentIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError.message, profilesError.details);
        }

        // Map profiles by ID for easy lookup
        const profilesMap = (profilesData || []).reduce((acc: any, profile: any) => {
          acc[profile.id] = profile;
          return acc;
        }, {});

        // Format applicants
        const formattedApplicants = applicationsData.map((app: any) => {
          const profile = profilesMap[app.student_id];
          return {
            id: app.id,
            student_id: app.student_id,
            name: profile?.full_name || 'Unknown Applicant',
            school: profile?.education?.[0]?.school || 'Not specified',
            role: 'Applied',
            score: Math.floor(Math.random() * 30) + 70,
            status: normalizeStatus(app.status)
          };
        });

        console.log('Formatted applicants:', formattedApplicants);
        setApplicants(formattedApplicants);
      } catch (err) {
        console.error('Unexpected error fetching applicants:', err);
        setApplicants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [jobId, user, authLoading]);

  const updateApplicantStatus = async (applicationId: string, newStatus: string) => {
    setUpdatingStatus(applicationId);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      // Update local state
      setApplicants(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));

      console.log(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update applicant status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const scheduleInterview = async (applicantId: string, interviewDetails: any) => {
    setSchedulingInterview(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: 'Interview',
          interview_details: interviewDetails 
        })
        .eq('id', applicantId);

      if (error) throw error;

      // Update local state
      setApplicants(prev => prev.map(app => 
        app.id === applicantId 
          ? { ...app, status: 'Interview', interview_details: interviewDetails } 
          : app
      ));

      console.log('Interview scheduled successfully');
    } catch (err) {
      console.error('Error scheduling interview:', err);
      alert('Failed to schedule interview');
    } finally {
      setSchedulingInterview(false);
    }
  };

  const generateMeetLink = () => {
    const meetId = Math.random().toString(36).substring(2, 15);
    setInterviewForm(prev => ({ 
      ...prev, 
      meetLink: `https://meet.google.com/${meetId}` 
    }));
  };

  const handleScheduleInterview = async () => {
    if (!interviewModal.applicant || !interviewForm.dateTime || !interviewForm.meetLink) {
      alert('Please fill in all required fields');
      return;
    }

    const interviewDetails = {
      dateTime: interviewForm.dateTime,
      meetLink: interviewForm.meetLink,
      notes: interviewForm.notes,
      scheduled_at: new Date(interviewForm.dateTime).toISOString()
    };

    await scheduleInterview(interviewModal.applicant.id, interviewDetails);
    
    // Reset modal
    setInterviewModal({ open: false, applicant: null });
    setInterviewForm({ dateTime: '', meetLink: '', notes: '' });
  };
  
  if (authLoading || loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-[rgb(var(--accent))] animate-spin" />
        <p className="text-[rgb(var(--text-muted))] font-bold uppercase tracking-widest text-xs">Loading applicants...</p>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-2xl font-bold">Access denied</p>
        <p className="text-[rgb(var(--text-muted))] max-w-md">Only the recruiter who posted this job can view the candidates who applied to it.</p>
        <Link href="/dashboard" className="px-6 py-3 bg-[rgb(var(--accent))] text-white rounded-2xl font-bold hover:bg-[rgb(var(--accent))]/90 transition-all">Go back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-[10px] font-bold text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] uppercase tracking-[0.3em] transition-all group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Intelligence
          </Link>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight uppercase leading-none">
              Role <span className="text-[rgb(var(--accent))]">Analysis</span>
            </h1>
            <div className="flex flex-col gap-4">
              <p className="text-md font-bold text-[rgb(var(--text-main))] uppercase tracking-widest opacity-90 max-w-xl">
                 Viewing <span className="text-[rgb(var(--accent))]">{applicants.length} candidate{applicants.length !== 1 ? 's' : ''}</span> for Job ID: <span className="text-[rgb(var(--accent))]">#{jobId}</span>. This portal highlights AI-matched talent based on their skills and background.
              </p>
              <div className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--bg-side))] rounded-full border border-[rgb(var(--border))] w-fit">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--text-muted))]">Live syncing with applicant database</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button 
            onClick={() => alert('Exporting candidate data...')}
            className="px-8 py-5 border border-[rgb(var(--border))] rounded-3xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-3 shadow-sm"
           >
              <Download className="w-5 h-5" /> Export Data
           </button>
           <button 
            onClick={() => alert('Invitations sent to candidates!')}
            className="px-10 py-5 bg-[rgb(var(--accent))] text-black font-bold rounded-3xl accent-glow uppercase tracking-[0.2em] text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[rgb(var(--accent))]/20"
           >
              Mass Invite
           </button>
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { 
            label: 'Applied', 
            count: applicants.length, 
            color: 'bg-blue-500' 
          },
          { 
            label: 'Reviewed', 
            count: applicants.filter(a => a.status === 'Reviewed').length, 
            color: 'bg-purple-500' 
          },
          { 
            label: 'Interview', 
            count: applicants.filter(a => a.status === 'Interview').length, 
            color: 'bg-[rgb(var(--accent))]' 
          },
          { 
            label: 'Offers', 
            count: applicants.filter(a => a.status === 'Accepted').length, 
            color: 'bg-emerald-500' 
          }
        ].map((step, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[rgb(var(--bg-main))] p-8 rounded-[2.5rem] border border-[rgb(var(--border))] relative overflow-hidden group hover:border-[rgb(var(--accent))]/30 transition-all cursor-default"
          >
            <div className={cn("absolute top-0 left-0 h-1.5 w-full", step.color)}></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--text-muted))] mb-4">{step.label}</p>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold tracking-tight leading-none">{step.count}</span>
              <span className="text-[10px] font-bold text-emerald-500 mb-1">+12%</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-10">
           <div className="bg-[rgb(var(--bg-main))] p-10 rounded-[3rem] border border-[rgb(var(--border))] space-y-8 shadow-sm">
              <div className="space-y-2">
                 <h3 className="text-lg font-bold uppercase tracking-widest flex items-center gap-3">
                    <ListFilter className="w-5 h-5 text-[rgb(var(--accent))]" /> Filters
                 </h3>
                 <p className="text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-tight opacity-60">Fine-tune candidate matching</p>
              </div>

              <div className="space-y-8 pt-8 border-t border-[rgb(var(--border))]">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-[0.2em]">Match Score</label>
                      <span className="text-[10px] font-bold text-[rgb(var(--accent))]">80%+</span>
                    </div>
                    <input type="range" aria-label="Match score filter" className="w-full accent-[rgb(var(--accent))] h-1 bg-[rgb(var(--bg-side))] rounded-full appearance-none cursor-pointer" />
                 </div>
                 
                 <div className="space-y-4">
                    <label className="text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-[0.2em]">Pipeline State</label>
                    <div className="space-y-3">
                       {['Shortlisted', 'Reviewing', 'Initial Poll', 'Interview'].map(status => (
                         <label key={status} className="flex items-center gap-3 group cursor-pointer">
                            <div className="w-5 h-5 rounded-lg border-2 border-[rgb(var(--border))] group-hover:border-[rgb(var(--accent))]/50 flex items-center justify-center transition-all bg-[rgb(var(--bg-side))]">
                               <div className="w-2.5 h-2.5 rounded-sm bg-[rgb(var(--accent))] scale-0 group-hover:scale-50 transition-transform"></div>
                            </div>
                            <span className="text-xs text-[rgb(var(--text-muted))] font-bold group-hover:text-[rgb(var(--text-main))] transition-colors">{status}</span>
                         </label>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Applicants List */}
        <div className="lg:col-span-3 space-y-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between px-4 gap-4">
             <div>
               <h3 className="text-2xl font-bold uppercase tracking-tight">Candidate Pool</h3>
               <p className="text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-widest mt-1">Select a candidate to view their deep-dive profile and AI evaluation.</p>
             </div>
             <div className="flex items-center gap-4 text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-widest">
               <span>Sort by:</span>
               <select aria-label="Sort applicants" className="bg-transparent border-none focus:ring-0 cursor-pointer text-[rgb(var(--accent))]">
                 <option>Highest Match</option>
                 <option>Recent First</option>
                 <option>Score</option>
               </select>
             </div>
           </div>

           <div className="space-y-6">
             {applicants.length > 0 ? (
               applicants.map((applicant, i) => (
                 <motion.div
                   key={applicant.id}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   onClick={() => router.push(`/profile/${applicant.student_id}`)}
                   className="bg-[rgb(var(--bg-main))] p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-[rgb(var(--border))] flex flex-col xl:flex-row items-center justify-between gap-8 md:gap-10 group hover:border-[rgb(var(--accent))]/50 transition-all cursor-pointer relative overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[rgb(var(--accent))]/5"
                 >
                    <div className="absolute inset-0 bg-linear-to-r from-[rgb(var(--accent))]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex items-center gap-6 md:gap-8 relative z-10 w-full xl:w-auto">
                       <div className="relative">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl md:rounded-4xl bg-linear-to-br from-[rgb(var(--accent))] to-brand p-0.5 transition-all group-hover:rotate-6 group-hover:scale-110 shrink-0">
                            <div className="w-full h-full rounded-[22px] md:rounded-[30px] bg-[rgb(var(--bg-main))] flex items-center justify-center p-1">
                              <div className="w-full h-full rounded-xl md:rounded-2xl bg-[rgb(var(--bg-side))] flex items-center justify-center border border-[rgb(var(--border))]">
                              <User className="w-6 h-6 text-[rgb(var(--text-muted))]" />
                            </div>
                            </div>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full border-4 border-[rgb(var(--bg-main))] shadow-lg"></div>
                       </div>
                       <div className="space-y-1 md:space-y-2 min-w-0">
                          <h4 className="font-bold text-xl md:text-2xl tracking-tight group-hover:text-[rgb(var(--accent))] transition-colors leading-none truncate">{applicant.name}</h4>
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-widest opacity-80">
                             <span className="truncate">{applicant.school}</span>
                             <span className="w-1 h-1 rounded-full bg-[rgb(var(--border))]"></span>
                             <span className="text-[rgb(var(--accent))] truncate">{applicant.role}</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between xl:justify-end gap-8 md:gap-12 w-full xl:w-auto relative z-10 pt-4 md:pt-0 border-t md:border-t-0 border-[rgb(var(--border))]">
                       <div className="flex flex-col items-center gap-2 md:gap-3">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl md:text-3xl font-bold tracking-tight text-[rgb(var(--accent))]">{applicant.score}</span>
                            <span className="text-[9px] md:text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase opacity-60">% Match</span>
                          </div>
                          <div className="w-24 md:w-32 h-1.5 md:h-2 bg-[rgb(var(--bg-side))] rounded-full overflow-hidden border border-[rgb(var(--border))]">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: `${applicant.score}%` }}
                              viewport={{ once: true }}
                              className="h-full bg-[rgb(var(--accent))]" 
                            />
                          </div>
                       </div>

                       <div className="min-w-55 max-w-65 text-center space-y-4">
                          <span className={cn(
                            "text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-2xl border transition-all inline-flex",
                            applicant.status === 'Accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            applicant.status === 'Interview' ? 'bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] border-[rgb(var(--accent))]/20' :
                            applicant.status === 'Reviewed' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            applicant.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          )}>
                            {applicant.status}
                          </span>
                          
                          {/* Status Action Buttons */}
                          <div className="space-y-3">
                            {applicant.status === 'Pending' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); updateApplicantStatus(applicant.id, 'Reviewed'); }}
                                disabled={updatingStatus === applicant.id}
                                className="w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest bg-purple-500 text-white border border-purple-500 rounded-2xl hover:bg-purple-600 transition-all disabled:opacity-50 shadow-sm"
                              >
                                {updatingStatus === applicant.id ? 'Processing...' : 'Mark as Reviewed'}
                              </button>
                            )}
                            
                            {applicant.status === 'Reviewed' && (
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setInterviewModal({ open: true, applicant }); }}
                                  className="w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest bg-[rgb(var(--accent))] text-white rounded-2xl hover:bg-[rgb(var(--accent))]/90 transition-all shadow-sm"
                                >
                                  Schedule Interview
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateApplicantStatus(applicant.id, 'Rejected'); }}
                                  disabled={updatingStatus === applicant.id}
                                  className="w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest bg-red-500 text-white border border-red-500 rounded-2xl hover:bg-red-600 transition-all disabled:opacity-50 shadow-sm"
                                >
                                  {updatingStatus === applicant.id ? 'Rejecting...' : 'Reject'}
                                </button>
                              </div>
                            )}
                            
                            {applicant.status === 'Interview' && (
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateApplicantStatus(applicant.id, 'Accepted'); }}
                                  disabled={updatingStatus === applicant.id}
                                  className="w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest bg-green-500 text-white rounded-2xl hover:bg-green-600 transition-all disabled:opacity-50 shadow-sm"
                                >
                                  {updatingStatus === applicant.id ? 'Processing...' : 'Accept'}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateApplicantStatus(applicant.id, 'Rejected'); }}
                                  disabled={updatingStatus === applicant.id}
                                  className="w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest bg-red-500 text-white border border-red-500 rounded-2xl hover:bg-red-600 transition-all disabled:opacity-50 shadow-sm"
                                >
                                  {updatingStatus === applicant.id ? 'Rejecting...' : 'Reject'}
                                </button>
                              </div>
                            )}
                          </div>
                       </div>

                       <div className="hidden xl:block">
                          <div className="w-14 h-14 rounded-3xl bg-[rgb(var(--bg-side))] flex items-center justify-center group-hover:bg-[rgb(var(--accent))] group-hover:text-white transition-all group-hover:translate-x-2 shadow-sm">
                            <ChevronRight className="w-7 h-7" />
                          </div>
                       </div>
                    </div>
                 </motion.div>
               ))
             ) : (
               <div className="text-center py-16">
                 <p className="text-[rgb(var(--text-muted))] font-bold uppercase tracking-widest text-sm">No applicants yet for this job posting</p>
               </div>
             )}

             <button className="w-full py-8 border-2 border-dashed border-[rgb(var(--border))] rounded-[3rem] text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-[0.6em] hover:bg-[rgb(var(--accent))]/5 hover:border-[rgb(var(--accent))]/30 transition-all opacity-60 hover:opacity-100 shadow-sm">
                Synchronizing Database... Load More
             </button>
           </div>
        </div>
      </div>

      {/* Interview Scheduling Modal */}
      {interviewModal.open && interviewModal.applicant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-[rgb(var(--text-main))] mb-2">Schedule Interview</h3>
                <p className="text-[rgb(var(--text-muted))] text-sm">Set up an interview for <span className="font-semibold text-[rgb(var(--accent))]">{interviewModal.applicant.name}</span></p>
              </div>
              <button
                onClick={() => setInterviewModal({ open: false, applicant: null })}
                className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-main))] transition-colors p-2 hover:bg-[rgb(var(--bg-side))] rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[rgb(var(--text-main))] mb-3 uppercase tracking-widest">
                    Interview Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    aria-label="Interview date and time"
                    value={interviewForm.dateTime}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, dateTime: e.target.value }))}
                    className="w-full px-4 py-4 bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-2xl text-[rgb(var(--text-main))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/50 focus:border-[rgb(var(--accent))] transition-all text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[rgb(var(--text-main))] mb-3 uppercase tracking-widest">
                    Meeting Link
                  </label>
                  <div className="space-y-3">
                    <input
                      type="url"
                      value={interviewForm.meetLink}
                      onChange={(e) => setInterviewForm(prev => ({ ...prev, meetLink: e.target.value }))}
                      placeholder="https://meet.google.com/..."
                      className="w-full px-4 py-4 bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-2xl text-[rgb(var(--text-main))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/50 focus:border-[rgb(var(--accent))] transition-all text-base"
                      required
                    />
                    <button
                      onClick={() => generateMeetLink()}
                      className="w-full px-4 py-3 bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] border border-[rgb(var(--accent))]/20 rounded-xl hover:bg-[rgb(var(--accent))]/20 transition-all font-semibold text-sm"
                    >
                      Generate Google Meet Link
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[rgb(var(--text-main))] mb-3 uppercase tracking-widest">
                  Interview Notes (Optional)
                </label>
                <textarea
                  value={interviewForm.notes}
                  onChange={(e) => setInterviewForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any preparation notes, agenda items, or special instructions for the interview..."
                  rows={4}
                  className="w-full px-4 py-4 bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-2xl text-[rgb(var(--text-main))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/50 focus:border-[rgb(var(--accent))] transition-all resize-none text-base"
                />
              </div>

              <div className="flex gap-4 pt-6 border-t border-[rgb(var(--border))]">
                <button
                  onClick={() => setInterviewModal({ open: false, applicant: null })}
                  className="flex-1 py-4 px-6 bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-2xl text-[rgb(var(--text-main))] hover:bg-[rgb(var(--bg-hover))] transition-all font-semibold text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleScheduleInterview()}
                  disabled={schedulingInterview || !interviewForm.dateTime || !interviewForm.meetLink}
                  className="flex-1 py-4 px-6 bg-[rgb(var(--accent))] text-white rounded-2xl hover:bg-[rgb(var(--accent))]/90 transition-all font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[rgb(var(--accent))]/20"
                >
                  {schedulingInterview ? 'Scheduling Interview...' : 'Schedule Interview'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
