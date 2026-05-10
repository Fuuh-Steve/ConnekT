'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Plus, CheckCircle, Smartphone, CreditCard, ChevronRight, Search, FileText, XCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

import { MOCK_JOBS } from '../mockData';

export const PostJobPage = () => {
    const { user } = useAuth();
    const { alert } = useToast();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        location: '',
        stipend: '',
        description: ''
    });

    const handlePublish = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        setLoading(true);
        try {
            // First get the recruiter's profile to get company name/logo
            const { data: profile } = await supabase
                .from('profiles')
                .select('company_name, company_logo')
                .eq('id', user.id)
                .single();

            const { error } = await supabase
                .from('jobs')
                .insert({
                    title: formData.title,
                    company: profile?.company_name || 'Company not provided',
                    location: formData.location,
                    description: formData.description,
                    tags: [formData.department, 'Full-time'],
                    logo: profile?.company_logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop',
                    posted_date: new Date().toISOString(),
                    recruiter_id: user.id
                });

            if (error) throw error;
            
            setStep(3);
        } catch (err) {
            console.error('Error posting job:', err);
            alert.error('Posting Failed', 'Failed to post job. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-10 py-10">
            <div className="space-y-2 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-[rgb(var(--text-main))] text-center">Create Job Posting</h1>
                <p className="text-[rgb(var(--text-muted))] text-center">Define the role and start finding the right talent for your team.</p>
            </div>

            <div className="flex items-center justify-between px-10 relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[rgb(var(--border))] -z-10"></div>
                {[1, 2, 3].map(i => (
                    <div key={i} className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-4",
                        step >= i ? "bg-[rgb(var(--accent))] text-white border-[rgb(var(--accent))]" : "bg-[rgb(var(--bg-side))] text-[rgb(var(--text-muted))] border-[rgb(var(--border))]"
                    )}>
                        {i}
                    </div>
                ))}
            </div>

            <div className="bg-[rgb(var(--bg-main))] p-8 md:p-10 rounded-2xl border border-[rgb(var(--border))] space-y-8 shadow-sm">
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-[rgb(var(--text-main))] border-l-4 border-[rgb(var(--accent))] pl-4">Job Details</h2>
                         <div className="space-y-4">
                            <InputField 
                                label="Job Title" 
                                placeholder="e.g. Senior Frontend Developer" 
                                value={formData.title}
                                onChange={(val: string) => setFormData({...formData, title: val})}
                            />
                            <InputField 
                                label="Department" 
                                placeholder="e.g. Engineering" 
                                value={formData.department}
                                onChange={(val: string) => setFormData({...formData, department: val})}
                            />
                            <div className="grid grid-cols-2 gap-6">
                                <InputField 
                                    label="Location" 
                                    placeholder="e.g. Remote / Douala, CM" 
                                    value={formData.location}
                                    onChange={(val: string) => setFormData({...formData, location: val})}
                                />
                                <InputField 
                                    label="Monthly Stipend (Range)" 
                                    placeholder="e.g. $500 - $1000" 
                                    value={formData.stipend}
                                    onChange={(val: string) => setFormData({...formData, stipend: val})}
                                />
                            </div>
                         </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-[rgb(var(--text-main))] border-l-4 border-[rgb(var(--accent))] pl-4">Job Description & Requirements</h2>
                        <textarea 
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl p-6 h-40 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all"
                            placeholder="Provide a detailed description of the role, responsibilities, and key requirements..."
                        ></textarea>
                    </div>
                )}
                 {step === 3 && (
                    <div className="text-center space-y-6 py-6">
                        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl flex items-center justify-center mx-auto">
                            <CheckCircle className="w-10 h-10 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                             <h2 className="text-2xl font-bold text-[rgb(var(--text-main))]">Posting is Live!</h2>
                             <p className="text-[rgb(var(--text-muted))] text-sm">Your job has been published and is now visible to students.</p>
                        </div>
                        <div className="flex justify-center">
                            <button 
                                onClick={() => router.push('/listings')}
                                className="px-8 py-3 bg-[rgb(var(--accent))] text-white font-bold rounded-xl shadow-lg shadow-[rgb(var(--accent))]/20"
                            >
                                Manage Listings
                            </button>
                        </div>
                    </div>
                )}

                {step < 3 && (
                    <div className="flex items-center justify-between pt-6 border-t border-[rgb(var(--border))]">
                        <button 
                            onClick={() => setStep(s => Math.max(1, s - 1))}
                            className="px-6 py-2 text-sm font-bold text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-main))] transition-colors"
                        >
                            Back
                        </button>
                        <button 
                            onClick={() => step === 1 ? setStep(2) : handlePublish()}
                            disabled={loading}
                            className="px-8 py-3 bg-[rgb(var(--text-main))] text-[rgb(var(--bg-main))] font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {step === 2 ? 'Publish Job' : 'Next Step'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const ManageListingsPage = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

  const fetchJobs = React.useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select(`
                    *,
                    applications (id)
                `)
                .eq('recruiter_id', user.id)
                .order('posted_date', { ascending: false });

            if (error) throw error;
            setJobs(data || []);
        } catch (err) {
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    React.useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const deleteJob = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;
        try {
            const { error } = await supabase
                .from('jobs')
                .delete()
                .eq('id', id);
            if (error) throw error;
            setJobs(jobs.filter(j => j.id !== id));
        } catch (err) {
            console.error('Error deleting job:', err);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-[rgb(var(--accent))] animate-spin" />
                <p className="text-[rgb(var(--text-muted))] font-bold uppercase tracking-widest text-xs">Loading Listings...</p>
            </div>
        );
    }

    return (
    <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-[rgb(var(--text-main))]">Job Management</h1>
                <p className="text-[rgb(var(--text-muted))] text-sm">Monitor performance and manage applicants for your active roles.</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="bg-[rgb(var(--bg-main))] px-4 py-2 rounded-xl border border-[rgb(var(--border))] flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-xs font-bold uppercase tracking-widest leading-none">{jobs.length} Active Listings</span>
                </div>
                <button 
                    onClick={() => router.push('/post')}
                    className="px-6 py-2 bg-[rgb(var(--accent))] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-[rgb(var(--accent))]/20"
                >
                    Post New
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
            {jobs.length > 0 ? jobs.map((job, idx) => (
                <motion.div 
                    key={job.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-[rgb(var(--bg-main))] p-6 md:p-8 rounded-4xl border border-[rgb(var(--border))] flex flex-col lg:flex-row lg:items-center justify-between gap-8 group hover:border-[rgb(var(--accent))]/40 transition-all shadow-sm relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4">
                       <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[9px] font-bold uppercase tracking-widest border border-emerald-500/20">
                          Active
                       </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl border border-[rgb(var(--border))] p-2 bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                            <Image 
                                src={job.logo} 
                                alt="Logo" 
                                width={64}
                                height={64}
                                className="max-w-full max-h-full object-contain" 
                            />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold text-[rgb(var(--text-main))] group-hover:text-[rgb(var(--accent))] transition-colors">{job.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-[rgb(var(--text-muted))] mt-1 font-medium">
                                <span className="flex items-center gap-1.5 font-bold"><Search className="w-3.5 h-3.5" /> Engineering</span>
                                <span className="w-1 h-1 rounded-full bg-[rgb(var(--border))]"></span>
                                <span>{job.location}</span>
                                <span className="w-1 h-1 rounded-full bg-[rgb(var(--border))]"></span>
                                <span>Posted {new Date(job.posted_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-10 justify-between lg:justify-end">
                        <div className="flex items-center gap-8 md:gap-12 h-14">
                            <div className="text-center group/stat">
                                <p className="text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-widest mb-1">Applications</p>
                                <p className="text-2xl font-bold text-[rgb(var(--text-main))] transition-transform group-hover/stat:scale-110">{job.applications?.length || 0}</p>
                            </div>
                            <div className="w-px h-full bg-[rgb(var(--border))]"></div>
                            <div className="text-center group/stat">
                                <p className="text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-widest mb-1">Views</p>
                                <p className="text-2xl font-bold text-[rgb(var(--accent))] transition-transform group-hover/stat:scale-110">{124 + idx * 45} <span className="text-xs"></span></p>
                            </div>
                        </div>
                         <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button 
                                onClick={() => router.push(`/applicants/${job.id}`)}
                                className="flex-1 sm:flex-none px-6 py-3.5 bg-[rgb(var(--accent))] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-[rgb(var(--accent))]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Manage Applicants
                            </button>
                            <button 
                                onClick={() => deleteJob(job.id)}
                                aria-label="Delete job posting"
                                className="p-3.5 text-[rgb(var(--text-muted))] hover:text-red-500 hover:bg-red-50 rounded-xl dark:hover:bg-red-900/10 transition-all border border-[rgb(var(--border))]"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )) : (
                <div className="text-center py-24 bg-[rgb(var(--bg-side))] rounded-[3rem] border border-dashed border-[rgb(var(--border))]">
                    <FileText className="w-16 h-16 text-[rgb(var(--text-muted))] mx-auto mb-6 opacity-20" />
                    <h3 className="text-xl font-bold mb-2">No active listings</h3>
                    <p className="text-[rgb(var(--text-muted))] mb-8">Ready to find some world-class talent?</p>
                    <button 
                        onClick={() => router.push('/post')}
                        className="px-8 py-3 bg-[rgb(var(--accent))] text-white font-bold rounded-xl shadow-lg shadow-[rgb(var(--accent))]/20"
                    >
                        Create Your First Post
                    </button>
                </div>
            )}
        </div>
    </div>
    );
};

const InputField = ({ label, placeholder, value, onChange }: any) => (
    <div className="space-y-1.5 flex-1 w-full">
        <label className="text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-widest block ml-1">{label}</label>
        <input 
            type="text" 
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all font-medium"
        />
    </div>
);
