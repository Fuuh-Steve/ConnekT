'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Github, Linkedin, Globe, MapPin, Briefcase, GraduationCap, Award, Zap, ChevronRight, Edit3, Download, CheckCircle, Camera, X, Save, Loader2, Plus, XCircle, ExternalLink, Smartphone } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const ProfilePage = ({ lookupBy }: { lookupBy?: string } = {}) => {
  const params = useParams();
  const paramUsername = params?.username as string;
  const username = lookupBy || paramUsername;
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  const isOwnProfile = !username || (profile && user && profile.id === user.id); 
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({
    full_name: '',
    username: '',
    bio: '',
    location: '',
    phone: '',
    availability_status: '',
    company_name: '',
    company_logo: '',
    experience: [],
    education: [],
    skills: [],
    github_url: '',
    linkedin_url: '',
    twitter_url: '',
    portfolio_url: '',
    resume_url: '',
  });
  const [selectedExperience, setSelectedExperience] = useState<any>(null);
  const [subscription, setSubscription] = useState<'free' | 'pro'>('free');
  
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const buildEditForm = (profileData: any) => ({
    full_name: profileData?.full_name || '',
    username: profileData?.username || '',
    bio: profileData?.bio || '',
    location: profileData?.location || '',
    phone: profileData?.phone || '',
    availability_status: profileData?.availability_status || '',
    company_name: profileData?.company_name || '',
    company_logo: profileData?.company_logo || '',
    experience: profileData?.experience || [],
    education: profileData?.education || [],
    skills: profileData?.skills || [],
    github_url: profileData?.github_url || '',
    linkedin_url: profileData?.linkedin_url || '',
    twitter_url: profileData?.twitter_url || '',
    portfolio_url: profileData?.portfolio_url || '',
    resume_url: profileData?.resume_url || '',
  });

  const openEditModal = () => {
    if (!profile) return;
    setEditFormData(buildEditForm(profile));
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        let query = supabase.from('profiles').select('*');
        
        if (username) {
          // Check if username looks like a UUID (for direct ID lookup)
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username);
          
          if (isUUID) {
            query = query.eq('id', username);
          } else {
            query = query.eq('username', username);
          }
        } else if (user) {
          query = query.eq('id', user.id);
        } else {
          setLoading(false);
          return;
        }

        const { data, error } = await query.single();
        
        if (data) {
          setProfile(data);
        } else if (error && !username && user) {
          // If profile doesn't exist for logged in user, create one
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({ id: user.id, email: user.email, role: 'student' })
            .select()
            .single();
          if (newProfile) setProfile(newProfile);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setSaving(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        const updateData: any = {};
        if (type === 'avatar') updateData.avatar_url = base64;
        else updateData.cover_url = base64;

        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);

        if (!error) {
          setProfile((prev: any) => ({ ...prev, ...updateData }));
          window.dispatchEvent(new Event('profile_updated'));
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading file:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setResumeUploading(true);
    setUploadError('');

    const fileExt = file.name.split('.').pop() || 'pdf';
    const filePath = `${user.id}/resume-${Date.now()}.${fileExt}`;

    try {
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('resumes')
        .upload(filePath, file, { upsert: true });

      if (uploadError || !uploadData) throw uploadError || new Error('Resume upload failed');

      const { data: urlData } = supabase
        .storage
        .from('resumes')
        .getPublicUrl(uploadData.path);

      if (!urlData?.publicUrl) throw new Error('Unable to generate resume URL');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ resume_url: urlData.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile((prev: any) => ({ ...prev, resume_url: urlData.publicUrl }));
    } catch (err: any) {
      console.error('Error uploading resume:', err);
      setUploadError(err.message || 'Unable to upload resume');
    } finally {
      setResumeUploading(false);
    }
  };

  const handleSaveProfile = async (formData: any) => {
    const profileId = profile?.id || user?.id;
    if (!profileId) {
      console.error('Cannot save profile: missing profile or user id');
      return;
    }

    setSaving(true);
    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', profileId)
        .select()
        .single();

      if (error) {
        console.error('Error saving profile:', error);
        return;
      }

      if (updatedProfile) {
        setProfile(updatedProfile);
        setIsEditModalOpen(false);
      }
    } catch (err) {
      console.error('Unexpected error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-[rgb(var(--accent))] animate-spin" />
        <p className="text-[rgb(var(--text-muted))] font-bold uppercase tracking-widest text-xs">Loading Profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500">
          <User className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold">Profile not found</h2>
        <Link href="/dashboard" className="text-[rgb(var(--accent))] font-bold flex items-center gap-2">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const EXPERIENCES = profile.experience || [];
  const EDUCATION = profile.education || [];
  const SKILLS = profile.skills || [];

  return (
    <div className="space-y-12 pb-20">
      {/* Profile Header */}
      <div className="relative">
        <div 
          className="h-48 md:h-64 bg-slate-100 dark:bg-slate-900 overflow-hidden relative border-b border-[rgb(var(--border))] group/cover cursor-pointer"
          onClick={() => isOwnProfile && coverInputRef.current?.click()}
        >
          {profile.cover_url ? (
            <Image 
              src={profile.cover_url} 
              alt="Cover" 
              fill
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-r from-[rgb(var(--accent))]/10 to-transparent"></div>
          )}
          
          {isOwnProfile && (
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white/90 dark:bg-slate-800/90 p-3 rounded-full shadow-lg flex items-center gap-2">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                <span className="text-xs font-bold uppercase tracking-wider">Change Cover Photo</span>
              </div>
            </div>
          )}
          <input 
            type="file" 
            aria-label="Upload cover photo"
            ref={coverInputRef} 
            onChange={(e) => handleFileUpload(e, 'cover')} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        <div className="max-w-6xl mx-auto px-6 md:px-8 -mt-20 md:-mt-24 relative z-10 flex flex-col md:flex-row items-end gap-6">
           <div className="relative group">
              <div 
                className={cn(
                  "w-40 h-40 md:w-48 md:h-48 rounded-2xl bg-white dark:bg-slate-800 p-1 shadow-lg border border-[rgb(var(--border))] relative overflow-hidden",
                  isOwnProfile && "cursor-pointer group/avatar"
                )}
                onClick={() => isOwnProfile && avatarInputRef.current?.click()}
              >
                  <div className="w-full h-full rounded-xl overflow-hidden relative bg-slate-100 flex items-center justify-center">
                    {profile.avatar_url ? (
                      <Image 
                        src={profile.avatar_url} 
                        alt="Avatar" 
                        width={192}
                        height={192}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User className="w-12 h-12 text-[rgb(var(--text-muted))] opacity-20" />
                    )}
                    
                    {isOwnProfile && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2">
                        {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                        <span className="text-[10px] font-bold uppercase tracking-widest">Update Photo</span>
                      </div>
                    )}
                  </div>
              </div>
              {isOwnProfile && (
                <>
                  <button 
                    onClick={() => avatarInputRef.current?.click()}
                    aria-label="Upload profile picture"
                    className="absolute bottom-3 right-3 w-10 h-10 rounded-lg bg-white dark:bg-slate-700 text-[rgb(var(--text-main))] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all border border-[rgb(var(--border))] z-20"
                  >
                     <Camera className="w-4 h-4" />
                  </button>
                  <input 
                    type="file" 
                    aria-label="Choose avatar file"
                    ref={avatarInputRef} 
                    onChange={(e) => handleFileUpload(e, 'avatar')} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </>
              )}
           </div>

           <div className="flex-1 space-y-3 pb-2 text-center md:text-left">
              <div className="space-y-1">
                 <div className="flex flex-col md:flex-row items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[rgb(var(--text-main))]">{profile.full_name || `@${profile.username}` || 'User'}</h1>
                    {profile.role === 'verified' && (
                      <div className="px-2.5 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20 rounded-full flex items-center gap-1.5">
                         <CheckCircle className="w-3 h-3" />
                         <span className="text-xs font-bold uppercase tracking-wider">Verified Pro</span>
                      </div>
                    )}
                 </div>
                 <p className="text-[rgb(var(--text-muted))] font-semibold text-sm">
                   {profile.bio || 'Product Focused Developer'} • {profile.location || 'Remote'}
                 </p>
                 {profile.role === 'recruiter' && profile.company_name ? (
                   <p className="text-[rgb(var(--text-muted))] font-semibold text-sm">{profile.company_name}</p>
                 ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1">
                 <SocialLink icon={Mail} label={profile.email} url={`mailto:${profile.email}`} />
                 {profile.phone && <SocialLink icon={Smartphone} label={profile.phone} url={`tel:${profile.phone}`} />}
                 {profile.github_url && <SocialLink icon={Github} label="GitHub" url={profile.github_url} />}
                 {profile.linkedin_url && <SocialLink icon={Linkedin} label="LinkedIn" url={profile.linkedin_url} />}
                 {profile.twitter_url && <SocialLink icon={Globe} label="Twitter" url={profile.twitter_url} />}
                 {profile.portfolio_url && <SocialLink icon={ExternalLink} label="Portfolio" url={profile.portfolio_url} />}
              </div>
           </div>

           <div className="pb-2 md:pb-4 w-full md:w-auto">
              {isOwnProfile ? (
                 <button 
                  onClick={openEditModal}
                  className="w-full md:w-auto px-8 py-3 bg-[rgb(var(--accent))] text-white font-bold rounded-xl shadow-lg shadow-[rgb(var(--accent))]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                 >
                    Edit Profile <Edit3 className="w-4 h-4" />
                 </button>
              ) : (
                 <button className="w-full md:w-auto px-8 py-3 bg-[rgb(var(--text-main))] text-[rgb(var(--bg-main))] font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                    Download Resume <Download className="w-4 h-4" />
                 </button>
              )}
           </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-12">
         {/* Left Column: Stats & Skills */}
         <div className="space-y-8">
            <div className="bg-[rgb(var(--bg-main))] p-6 rounded-2xl border border-[rgb(var(--border))] space-y-6 shadow-sm">
               <h3 className="text-sm font-bold uppercase tracking-wider flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[rgb(var(--accent))]" /> Technical Skills
                  </div>
                  <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full border border-amber-500/20">AI Verified</span>
               </h3>
               <div className="space-y-5">
                  {SKILLS.length > 0 ? SKILLS.map((skill: any, i: number) => (
                    <SkillItem key={i} label={skill.name} progress={skill.level} delay={0.1 * (i + 1)} />
                  )) : (
                    <p className="text-xs text-[rgb(var(--text-muted))]">No skills added yet.</p>
                  )}
               </div>
            </div>

            <div className="bg-[rgb(var(--bg-main))] p-6 rounded-2xl border border-[rgb(var(--border))] space-y-4 shadow-sm">
               <div className="flex items-center justify-between">
                 <h3 className="text-sm font-bold uppercase tracking-wider">Resume</h3>
                 {profile.resume_url ? (
                   <a href={profile.resume_url} target="_blank" rel="noreferrer" className="text-[rgb(var(--accent))] text-xs font-bold">View</a>
                 ) : null}
               </div>
               <p className="text-xs text-[rgb(var(--text-muted))]">Upload a CV for recruiters to download from your student profile.</p>
               <div className="flex flex-col gap-3">
                 {profile.resume_url ? (
                   <a
                     href={profile.resume_url}
                     target="_blank"
                     rel="noreferrer"
                     className="block text-sm font-bold text-[rgb(var(--text-main))] underline underline-offset-4"
                   >
                     Download CV
                   </a>
                 ) : (
                   <p className="text-xs text-[rgb(var(--text-muted))]">No CV uploaded yet.</p>
                 )}
                 <button
                   onClick={() => resumeInputRef.current?.click()}
                   disabled={resumeUploading}
                   className="px-4 py-3 bg-[rgb(var(--accent))] text-white rounded-xl font-bold text-sm hover:bg-[rgb(var(--accent))]/90 transition-all disabled:opacity-70"
                 >
                   {resumeUploading ? 'Uploading...' : profile.resume_url ? 'Update CV' : 'Upload CV'}
                 </button>
                 {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
                 <input
                   type="file"
                   aria-label="Upload curriculum vitae"
                   accept=".pdf,.doc,.docx"
                   ref={resumeInputRef}
                   onChange={handleResumeUpload}
                   className="hidden"
                 />
               </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/20">
               <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 flex items-center justify-between">
                 Availability
                 <span className="text-[8px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">PRO</span>
               </h3>
               <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
                 {profile.availability_status || "Open to new opportunities."}
               </p>
            </div>
         </div>

         {/* Middle Column: Experience */}
         <div className="lg:col-span-2 space-y-10">
            <section className="space-y-6">
               <div className="space-y-1 border-l-4 border-[rgb(var(--accent))] pl-4">
                  <h2 className="text-2xl font-bold tracking-tight">Work Experience</h2>
                  <p className="text-[13px] text-[rgb(var(--text-muted))] font-bold uppercase tracking-wider">Professional Journey</p>
               </div>

               <div className="space-y-4">
                  {EXPERIENCES.length > 0 ? EXPERIENCES.map((exp: any, idx: number) => (
                    <ExperienceCard 
                      key={idx}
                      {...exp}
                      delay={0.1 * (idx + 1)}
                      onClick={() => setSelectedExperience(exp)}
                    />
                  )) : (
                    <p className="text-sm text-[rgb(var(--text-muted))] italic">No experience documented yet.</p>
                  )}
               </div>
            </section>

            <section className="space-y-6">
               <div className="space-y-1 border-l-4 border-slate-300 dark:border-slate-700 pl-4">
                  <h2 className="text-2xl font-bold tracking-tight">Education</h2>
                  <p className="text-[13px] text-[rgb(var(--text-muted))] font-bold uppercase tracking-wider">Academic Background</p>
               </div>

               <div className="space-y-4">
                  {EDUCATION.length > 0 ? EDUCATION.map((edu: any, i: number) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="bg-[rgb(var(--bg-main))] p-6 rounded-2xl border border-[rgb(var(--border))] group hover:border-[rgb(var(--accent))]/30 transition-all shadow-soft"
                    >
                       <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-[rgb(var(--bg-side))] rounded-xl flex items-center justify-center border border-[rgb(var(--border))] group-hover:scale-105 transition-transform">
                                <GraduationCap className="w-6 h-6 text-[rgb(var(--accent))]" />
                             </div>
                             <div className="text-center sm:text-left">
                                <h4 className="font-bold text-lg leading-tight group-hover:text-[rgb(var(--accent))] transition-colors">{edu.degree}</h4>
                                <p className="text-xs font-semibold text-[rgb(var(--text-muted))] mt-1">{edu.school} • {edu.period}</p>
                             </div>
                          </div>
                          {edu.gpa && (
                            <div className="px-3 py-1 bg-[rgb(var(--accent))]/10 dark:bg-slate-800 rounded-lg border border-[rgb(var(--accent))]/20 shadow-sm">
                                 <span className="text-xs font-extrabold text-[rgb(var(--accent))] font-mono">{edu.gpa} GPA</span>
                            </div>
                          )}
                       </div>
                    </motion.div>
                  )) : (
                    <p className="text-sm text-[rgb(var(--text-muted))] italic">Education history not provided.</p>
                  )}
               </div>
            </section>
         </div>
      </div>
      
      {/* Experience Detail Modal */}
      <AnimatePresence>
        {selectedExperience && (
          <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExperience(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[rgb(var(--bg-main))] rounded-3xl shadow-2xl border border-[rgb(var(--border))] overflow-hidden flex flex-col z-10"
            >
              <div className="p-6 border-b border-[rgb(var(--border))] flex items-center justify-between bg-[rgb(var(--bg-side))]">
                <div>
                  <h3 className="text-xl font-bold text-[rgb(var(--text-main))]">{selectedExperience.role}</h3>
                  <p className="text-sm font-bold text-[rgb(var(--accent))] uppercase tracking-wider mt-1">{selectedExperience.company}</p>
                </div>
                <button onClick={() => setSelectedExperience(null)} aria-label="Close experience details" className="p-2 hover:bg-[rgb(var(--bg-main))] rounded-xl transition-all">
                  <X className="w-5 h-5 text-[rgb(var(--text-main))]" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--text-muted))]">Role Context</p>
                  <p className="text-sm text-[rgb(var(--text-main))] leading-relaxed font-medium">
                    {selectedExperience.desc}
                  </p>
                </div>

                {selectedExperience.details && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--text-muted))]">Key Responsibilities</p>
                    <ul className="space-y-3">
                      {selectedExperience.details.map((detail: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-sm font-medium text-[rgb(var(--text-muted))]">
                          <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedExperience.skills && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--text-muted))]">Technologies Used</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedExperience.skills.map((skill: string) => (
                        <span key={skill} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold border border-[rgb(var(--border))] text-[rgb(var(--text-main))]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-[rgb(var(--bg-side))] border-t border-[rgb(var(--border))]">
                <button 
                  onClick={() => setSelectedExperience(null)}
                  className="w-full py-4 bg-[rgb(var(--accent))] text-white font-bold rounded-2xl shadow-xl shadow-[rgb(var(--accent))]/20 transition-all active:scale-95 flex items-center justify-center underline-offset-4 decoration-2"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSave={handleSaveProfile}
        formData={editFormData}
        setFormData={setEditFormData}
        saving={saving}
        profileRole={profile?.role}
      />
    </div>
  );
};

const EditProfileModal = ({ isOpen, onClose, onSave, formData, setFormData, saving, profileRole }: any) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'exp' | 'edu' | 'skills' | 'social'>('basic');

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('basic');
  }, [isOpen]);

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        { role: '', company: '', period: '', desc: '', details: [], skills: [] }
      ]
    });
    setActiveTab('exp');
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        { school: '', degree: '', period: '', gpa: '' }
      ]
    });
    setActiveTab('edu');
  };

  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, { name: '', level: 50 }]
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[rgb(var(--bg-main))] rounded-3xl shadow-2xl border border-[rgb(var(--border))] overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-[rgb(var(--border))] flex items-center justify-between bg-[rgb(var(--bg-side))]">
              <h3 className="text-xl font-bold">Update Profile</h3>
              <button onClick={onClose} aria-label="Close dialog" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-side))] overflow-x-auto">
              {[
                { id: 'basic', label: 'Basic Info', icon: User },
                { id: 'exp', label: 'Experience', icon: Briefcase },
                { id: 'edu', label: 'Education', icon: GraduationCap },
                { id: 'skills', label: 'Skills', icon: Zap },
                { id: 'social', label: 'Social', icon: Globe },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-6 py-4 text-xs font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all whitespace-nowrap",
                    activeTab === tab.id 
                      ? "border-[rgb(var(--accent))] text-[rgb(var(--accent))] bg-[rgb(var(--bg-main))]" 
                      : "border-transparent text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-main))]"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-8 space-y-8 overflow-y-auto flex-1 bg-[rgb(var(--bg-main))]">
              {activeTab === 'basic' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--text-muted))] ml-1">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        placeholder="e.g. Steve Ferguson"
                        className="w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--text-muted))] ml-1">Username</label>
                      <input 
                        type="text" 
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        placeholder="e.g. steveroger"
                        className="w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--text-muted))] ml-1">One-line Bio</label>
                    <textarea 
                      rows={2}
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="e.g. Full-stack developer passionate about building scalable web applications."
                      className="w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--text-muted))] ml-1">Location</label>
                      <input 
                        type="text" 
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="e.g. Yaoundé, Cameroon"
                        className="w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--text-muted))] ml-1">Phone</label>
                      <input 
                        type="text" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="e.g. +237 699 123 456"
                        className="w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--text-muted))] ml-1">Availability</label>
                    <input 
                      type="text" 
                      value={formData.availability_status}
                      onChange={(e) => setFormData({...formData, availability_status: e.target.value})}
                      placeholder="e.g. Open to internships, part-time or freelance work"
                      className="w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all"
                    />
                  </div>

                  {profileRole === 'recruiter' && (
                    <div className="pt-4 border-t border-[rgb(var(--border))] space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--accent))]">Recruiter Information</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--text-muted))] ml-1">Company Name</label>
                          <input 
                            type="text" 
                            value={formData.company_name}
                            onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                            placeholder="e.g. TechFlow Inc."
                            className="w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--text-muted))] ml-1">Company Logo URL</label>
                          <input 
                            type="text" 
                            value={formData.company_logo}
                            onChange={(e) => setFormData({...formData, company_logo: e.target.value})}
                            placeholder="https://example.com/logo.png"
                            className="w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'exp' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--text-muted))]">Work History</p>
                    <button 
                      onClick={addExperience}
                      className="flex items-center gap-2 text-[rgb(var(--accent))] font-bold text-xs"
                    >
                      <Plus className="w-4 h-4" /> Add Role
                    </button>
                  </div>
                  
                  <div className="space-y-10">
                    {formData.experience.map((exp: any, i: number) => (
                      <div key={i} className="relative p-6 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-side))] space-y-4">
                        <button 
                          onClick={() => {
                            const newExp = [...formData.experience];
                            newExp.splice(i, 1);
                            setFormData({...formData, experience: newExp});
                          }}
                          aria-label="Remove experience entry"
                          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all border-2 border-[rgb(var(--bg-main))]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <InputField 
                            label="Role" 
                            placeholder="e.g. Software Engineer" 
                            value={exp.role}
                            onChange={(val) => {
                              const newExp = [...formData.experience];
                              newExp[i].role = val;
                              setFormData({...formData, experience: newExp});
                            }}
                          />
                          <InputField 
                            label="Company" 
                            placeholder="e.g. Tech Corp" 
                            value={exp.company}
                            onChange={(val) => {
                              const newExp = [...formData.experience];
                              newExp[i].company = val;
                              setFormData({...formData, experience: newExp});
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <InputField 
                            label="Period" 
                            placeholder="e.g. Jan 2022 - Present" 
                            value={exp.period}
                            onChange={(val) => {
                              const newExp = [...formData.experience];
                              newExp[i].period = val;
                              setFormData({...formData, experience: newExp});
                            }}
                          />
                        </div>
                        <div className="space-y-1.5 leading-none">
                          <label className="text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-widest">Description</label>
                          <textarea 
                            value={exp.desc}
                            onChange={(e) => {
                              const newExp = [...formData.experience];
                              newExp[i].desc = e.target.value;
                              setFormData({...formData, experience: newExp});
                            }}
                            className="w-full bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-xl p-4 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all resize-none"
                            rows={3}
                            placeholder="Briefly describe your responsibilities..."
                          />
                        </div>
                      </div>
                    ))}

                    {formData.experience.length === 0 && (
                      <div className="text-center py-10 border-2 border-dashed border-[rgb(var(--border))] rounded-2xl">
                        <Briefcase className="w-8 h-8 text-[rgb(var(--text-muted))] mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-bold text-[rgb(var(--text-muted))]">No experience added yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'edu' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--text-muted))]">Academic Background</p>
                    <button 
                      onClick={addEducation}
                      className="flex items-center gap-2 text-[rgb(var(--accent))] font-bold text-xs"
                    >
                      <Plus className="w-4 h-4" /> Add School
                    </button>
                  </div>

                  <div className="space-y-6">
                    {formData.education.map((edu: any, i: number) => (
                      <div key={i} className="relative p-6 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-side))] space-y-4">
                        <button 
                          onClick={() => {
                            const newEdu = [...formData.education];
                            newEdu.splice(i, 1);
                            setFormData({...formData, education: newEdu});
                          }}
                          aria-label="Remove education entry"
                          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all border-2 border-[rgb(var(--bg-main))]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <InputField 
                            label="Degree" 
                            placeholder="e.g. B.Sc Computer Science" 
                            value={edu.degree}
                            onChange={(val) => {
                              const newEdu = [...formData.education];
                              newEdu[i].degree = val;
                              setFormData({...formData, education: newEdu});
                            }}
                          />
                          <InputField 
                            label="School" 
                            placeholder="e.g. Unilag" 
                            value={edu.school}
                            onChange={(val) => {
                              const newEdu = [...formData.education];
                              newEdu[i].school = val;
                              setFormData({...formData, education: newEdu});
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <InputField 
                            label="Period" 
                            placeholder="e.g. 2018 - 2022" 
                            value={edu.period}
                            onChange={(val) => {
                              const newEdu = [...formData.education];
                              newEdu[i].period = val;
                              setFormData({...formData, education: newEdu});
                            }}
                          />
                          <InputField 
                            label="GPA (optional)" 
                            placeholder="e.g. 4.5/5.0" 
                            value={edu.gpa}
                            onChange={(val) => {
                              const newEdu = [...formData.education];
                              newEdu[i].gpa = val;
                              setFormData({...formData, education: newEdu});
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--text-muted))]">Technical Skills</p>
                    <button 
                      onClick={addSkill}
                      className="flex items-center gap-2 text-[rgb(var(--accent))] font-bold text-xs"
                    >
                      <Plus className="w-4 h-4" /> Add Skill Tag
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.skills.map((skill: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-side))] group">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                             <input 
                              type="text" 
                              value={skill.name}
                              onChange={(e) => {
                                const newSkills = [...formData.skills];
                                newSkills[i].name = e.target.value;
                                setFormData({...formData, skills: newSkills});
                              }}
                              placeholder="e.g. React"
                              className="bg-transparent font-bold text-sm focus:outline-none w-full"
                             />
                             <span className="text-[10px] font-mono text-[rgb(var(--accent))] font-bold">{skill.level}%</span>
                          </div>
                          <input 
                            type="range" 
                            aria-label={`Skill level for ${skill.name}`}
                            min="0" 
                            max="100" 
                            value={skill.level}
                            onChange={(e) => {
                              const newSkills = [...formData.skills];
                              newSkills[i].level = parseInt(e.target.value);
                              setFormData({...formData, skills: newSkills});
                            }}
                            className="w-full accent-[rgb(var(--accent))]"
                          />
                        </div>
                        <button 
                          onClick={() => {
                            const newSkills = [...formData.skills];
                            newSkills.splice(i, 1);
                            setFormData({...formData, skills: newSkills});
                          }}
                          aria-label="Remove skill"
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <p className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--text-muted))]">Social Media & Portfolio</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                      label="GitHub Profile URL" 
                      placeholder="https://github.com/your-username" 
                      value={formData.github_url}
                      onChange={(val: string) => setFormData({...formData, github_url: val})}
                    />
                    <InputField 
                      label="LinkedIn Profile URL" 
                      placeholder="https://linkedin.com/in/your-username" 
                      value={formData.linkedin_url}
                      onChange={(val: string) => setFormData({...formData, linkedin_url: val})}
                    />
                    <InputField 
                      label="Twitter Profile URL" 
                      placeholder="https://twitter.com/your-username" 
                      value={formData.twitter_url}
                      onChange={(val: string) => setFormData({...formData, twitter_url: val})}
                    />
                    <InputField 
                      label="Portfolio Website" 
                      placeholder="https://your-portfolio.me" 
                      value={formData.portfolio_url}
                      onChange={(val: string) => setFormData({...formData, portfolio_url: val})}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-[rgb(var(--bg-side))] border-t border-[rgb(var(--border))] flex items-center justify-between gap-4">
              <button 
                onClick={onClose}
                className="px-6 py-4 text-sm font-bold text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-main))] underline-offset-4 hover:underline"
              >
                Cancel
              </button>
              <button 
                onClick={() => onSave(formData)}
                disabled={saving}
                className="px-8 py-4 bg-[rgb(var(--accent))] text-white font-bold rounded-2xl shadow-xl shadow-[rgb(var(--accent))]/20 flex items-center justify-center gap-2 disabled:opacity-70 flex-1 md:flex-none md:min-w-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Profile
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const SocialLink = ({ icon: Icon, label, url }: any) => (
  <a 
    href={url || '#'} 
    target={url ? "_blank" : undefined} 
    rel={url ? "noopener noreferrer" : undefined}
    className="flex items-center gap-1.5 group cursor-pointer"
  >
     <div className="w-7 h-7 rounded-lg bg-[rgb(var(--bg-side))] flex items-center justify-center text-[rgb(var(--text-muted))] group-hover:bg-[rgb(var(--accent))] group-hover:text-white transition-all border border-[rgb(var(--border))]">
        <Icon className="w-3.5 h-3.5" />
     </div>
     <span className="text-xs font-bold text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--text-main))] transition-colors truncate max-w-37.5">{label}</span>
  </a>
);

const SkillItem = ({ label, progress, delay }: any) => (
  <div className="space-y-1.5 group">
     <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold uppercase tracking-wider text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--text-main))] transition-colors">{label}</span>
        <span className="text-[12px] font-bold text-[rgb(var(--accent))]">{progress}%</span>
     </div>
     <div className="h-1.5 w-full bg-[rgb(var(--bg-side))] rounded-full overflow-hidden border border-[rgb(var(--border))/10">
        <motion.div 
           initial={{ width: 0 }}
           whileInView={{ width: `${progress}%` }}
           viewport={{ once: true }}
           transition={{ duration: 1.5, delay }}
           className="h-full bg-[rgb(var(--accent))]" 
        />
     </div>
  </div>
);

const ExperienceCard = ({ role, company, period, desc, delay, onClick }: any) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.98 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay }}
    onClick={onClick}
    className="bg-[rgb(var(--bg-main))] p-6 rounded-2xl border border-[rgb(var(--border))] group hover:border-[rgb(var(--accent))]/30 transition-all shadow-soft cursor-pointer active:scale-[0.99]"
  >
     <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
        <div className="space-y-2 text-center sm:text-left flex-1">
           <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h4 className="font-bold text-xl group-hover:text-[rgb(var(--accent))] transition-colors">{role}</h4>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
              <p className="text-[13px] font-bold text-[rgb(var(--accent))] uppercase tracking-wider">{company}</p>
           </div>
           <p className="text-[12px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-widest">{period}</p>
           <p className="text-[15px] text-[rgb(var(--text-muted))] leading-relaxed mt-1 font-medium line-clamp-2">{desc}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[rgb(var(--bg-side))] flex items-center justify-center border border-[rgb(var(--border))] group-hover:bg-[rgb(var(--accent))] group-hover:text-white transition-all text-[rgb(var(--text-muted))]">
           <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </div>
     </div>
  </motion.div>
);


const InputField = ({ label, placeholder, value, onChange }: any) => (
  <div className="space-y-1.5 flex-1 w-full">
    <label className="text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-widest block ml-1">{label}</label>
    <input 
      type="text" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all font-medium"
    />
  </div>
);
