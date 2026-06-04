'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, MapPin, Calendar, Users, Zap, 
  ChevronLeft, Share2, Bookmark, ShieldCheck,
  Code2, Terminal, Cpu, CheckCircle, Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { JobListing } from '../types';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export const JobDetails = () => {
  const params = useParams();
  const jobId = params?.jobId as string;
  const { user } = useAuth();
  const router = useRouter();
  const [job, setJob] = useState<JobListing | null>(null);
  const [recruiterCompany, setRecruiterCompany] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [success, setSuccess] = useState(false);

  const displayCompany = recruiterCompany || job?.company || 'Company';

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (error) {
          console.error('Error fetching job:', error);
        } else if (data) {
          setJob({
            ...data,
            postedDate: new Date(data.posted_date).toLocaleDateString(),
            matchScore: 95 // Temporary
          } as JobListing);

          if (data.recruiter_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('company_name')
              .eq('id', data.recruiter_id)
              .single();

            if (profileData?.company_name) {
              setRecruiterCompany(profileData.company_name);
            }
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    
    setApplying(true);
    try {
      const { error } = await supabase
        .from('applications')
        .insert({ job_id: jobId, student_id: user.id, status: 'pending' });

      if (error) throw error;
      
      setSuccess(true);
    } catch (err: any) {
      console.error('Error applying:', err);
      // If already applied, Supabase will return error because of unique constraint
      if (err.code === '23505') {
        alert('You have already applied for this position.');
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-[rgb(var(--accent))] animate-spin" />
        <p className="text-[rgb(var(--text-muted))] font-bold uppercase tracking-widest text-xs">Loading Job Details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20 px-6">
        <h2 className="text-2xl font-bold mb-4">Job not found</h2>
        <button onClick={() => router.push('/jobs')} className="text-[rgb(var(--accent))] font-bold flex items-center justify-center gap-2 mx-auto">
          <ChevronLeft className="w-4 h-4" /> Back to Job Board
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Jobs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="bg-[rgb(var(--bg-main))] p-6 md:p-10 rounded-2xl border border-[rgb(var(--border))]">
            <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white border border-[rgb(var(--border))] p-2 shrink-0 shadow-sm">
                <Image 
                  src={job.logo} 
                  alt={displayCompany} 
                  width={96}
                  height={96}
                  className="w-full h-full rounded-xl object-contain" 
                />
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[rgb(var(--text-muted))] font-medium">
                  <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-[rgb(var(--accent))]" /> {displayCompany}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[rgb(var(--accent))]" /> {job.location}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[rgb(var(--accent))]" /> Posted {job.postedDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <section className="bg-[rgb(var(--bg-main))] p-6 md:p-10 rounded-2xl border border-[rgb(var(--border))] space-y-6 md:space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-3">
                Job Description
              </h2>
              <div className="w-12 h-1 bg-[rgb(var(--accent))] rounded-full"></div>
              <p className="text-[rgb(var(--text-muted))] leading-relaxed text-base md:text-lg">
                We are looking for a highly motivated {job.title} to join our core team. You will be responsible for helping us build innovative solutions and scaling our technology platforms to reach more students.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 pt-4">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--accent))]">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map(tag => (
                    <div key={tag} className="px-3 py-1.5 bg-[rgb(var(--bg-side))] rounded-lg border border-[rgb(var(--border))] text-[10px] font-bold">
                       {tag}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                 <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600">Company Perks</h3>
                 <ul className="space-y-2.5">
                    {['Flexible Working Hours', 'Competitive Stipend', 'Mentorship Program', 'Global Network'].map(perk => (
                       <li key={perk} className="flex items-center gap-2.5 text-sm text-[rgb(var(--text-muted))] font-medium">
                          <CheckCircle className="w-4 h-4 text-emerald-500" /> {perk}
                       </li>
                    ))}
                 </ul>
              </div>
            </div>
          </section>

          {/* Application Form */}
          {!success && (
            <section id="apply" className="bg-[rgb(var(--bg-main))] p-6 md:p-10 rounded-2xl border border-[rgb(var(--border))] space-y-6 md:space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Apply for this Position</h2>
                <p className="text-sm text-[rgb(var(--text-muted))]">Your profile information will be shared with the recruiter automatically.</p>
              </div>

              <form onSubmit={handleApply} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[rgb(var(--text-muted))] ml-1">Portfolio (GitHub, LinkedIn, etc.)</label>
                    <input type="url" placeholder="https://..." className="w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[rgb(var(--text-muted))] ml-1">Phone Number</label>
                    <input type="tel" placeholder="+237 ..." className="w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-[rgb(var(--text-muted))] ml-1">Why should we hire you?</label>
                   <textarea rows={4} placeholder="Briefly describe your experience and interest..." className="w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all"></textarea>
                </div>
                
                <button 
                  disabled={applying}
                  className="w-full py-4 bg-[rgb(var(--accent))] text-white font-bold rounded-xl hover:bg-[rgb(var(--accent))]/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[rgb(var(--accent))]/20"
                >
                  {applying ? (
                    <>
                      <Zap className="w-4 h-4 animate-bounce" />
                      <span>Sending Application...</span>
                    </>
                  ) : (
                    <span>Submit Application</span>
                  )}
                </button>
              </form>
            </section>
          )}

          <AnimatePresence>
            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-[rgb(var(--bg-main))] p-10 md:p-16 rounded-2xl text-center space-y-6 md:space-y-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/5"
              >
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                   <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight">Application Sent!</h2>
                  <p className="text-[rgb(var(--text-muted))] text-lg">The recruiter has been notified. You can track your application status in your dashboard.</p>
                </div>
                <Link href="/dashboard" className="inline-block px-8 py-3 bg-[rgb(var(--text-main))] text-[rgb(var(--bg-main))] font-bold rounded-xl hover:bg-[rgb(var(--accent))] hover:text-white transition-all">
                  Go to Dashboard
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="space-y-6">
          <div className="bg-[rgb(var(--bg-main))] p-6 md:p-8 rounded-2xl border border-[rgb(var(--border))] space-y-6 sticky top-32 shadow-sm">
            <div className="space-y-1">
               <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider">Match Score</p>
                  <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold uppercase tracking-widest">AI Analysis</span>
               </div>
               <div className="flex items-center gap-3">
                  <p className="text-4xl font-bold text-[rgb(var(--accent))]">{job.matchScore}%</p>
                  <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">PRO</span>
               </div>
            </div>
            
            <div className="space-y-4 pt-6 border-t border-[rgb(var(--border))]">
               <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-[rgb(var(--text-muted))]">Total Applicants</span>
                  <span>142</span>
               </div>
               <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-[rgb(var(--text-muted))]">Verified Recruiter</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
               </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
               <button className="w-full py-3 bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:border-[rgb(var(--accent))] transition-all">
                  <Share2 className="w-4 h-4" /> <span>Share Role</span>
               </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

