'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, GraduationCap, Zap, Globe, X, Plus, XCircle, Loader2, Save, FileText, Download, Upload } from 'lucide-react';
import { cn } from '../lib/utils';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => Promise<void>;
  profile: any;
  saving: boolean;
}

export const EditProfileModal = ({ isOpen, onClose, onSave, profile, saving }: EditProfileModalProps) => {
  const buildFormData = (p: any) => ({
    full_name: p?.full_name || '',
    username: p?.username || '',
    bio: p?.bio || '',
    location: p?.location || '',
    company_name: p?.company_name || '',
    company_logo: p?.company_logo || '',
    experience: p?.experience ? JSON.parse(JSON.stringify(p.experience)) : [],
    education: p?.education ? JSON.parse(JSON.stringify(p.education)) : [],
    skills: p?.skills ? JSON.parse(JSON.stringify(p.skills)) : [],
    github_url: p?.github_url || '',
    linkedin_url: p?.linkedin_url || '',
    twitter_url: p?.twitter_url || '',
    portfolio_url: p?.portfolio_url || '',
    resume_url: p?.resume_url || '',
    resume_name: p?.resume_name || '',
  });

  const [formData, setFormData] = useState(() => buildFormData(profile));
  const [activeTab, setActiveTab] = useState<'basic' | 'exp' | 'edu' | 'skills' | 'social' | 'resume'>('basic');
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [resumeUploading, setResumeUploading] = useState(false);

  // Re-sync form data every time the modal opens so it always reflects the latest saved profile
  useEffect(() => {
    if (isOpen) {
      setFormData(buildFormData(profile));
      setActiveTab('basic');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setFormData({
        ...formData,
        resume_url: base64,
        resume_name: file.name
      });
      setResumeUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
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
                { id: 'resume', label: 'Resume', icon: FileText },
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
                        className="w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--text-muted))] ml-1">Username</label>
                      <input 
                        type="text" 
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        placeholder="e.g. steveroger"
                        className="w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all font-semibold"
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
                      className="w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all resize-none font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--text-muted))] ml-1">Location</label>
                    <input 
                      type="text" 
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="e.g. Yaoundé, Cameroon"
                      className="w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all font-semibold"
                    />
                  </div>

                  {profile.role === 'recruiter' && (
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
                            className="w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all font-semibold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--text-muted))] ml-1">Company Logo URL</label>
                          <input 
                            type="text" 
                            value={formData.company_logo}
                            onChange={(e) => setFormData({...formData, company_logo: e.target.value})}
                            placeholder="https://example.com/logo.png"
                            className="w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all font-semibold"
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
                            className="w-full bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-xl p-4 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all resize-none font-semibold"
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

              {activeTab === 'resume' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--text-muted))]">
                      Curriculum Vitae (CV)
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-8 border-2 border-dashed border-[rgb(var(--accent))]/30 rounded-2xl bg-[rgb(var(--accent))]/5 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[rgb(var(--accent))]/60 transition-all" onClick={() => resumeInputRef.current?.click()}>
                      <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--accent))]/10 flex items-center justify-center text-[rgb(var(--accent))]">
                        {resumeUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                      </div>
                      <div className="text-center space-y-2">
                        <p className="font-bold text-sm text-[rgb(var(--text-main))]">
                          {resumeUploading ? 'Uploading...' : formData.resume_name ? formData.resume_name : 'Upload Your CV/Resume'}
                        </p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">Click to browse or drag & drop PDF, DOC, DOCX</p>
                      </div>
                      <input
                        ref={resumeInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                        className="hidden"
                        aria-label="Upload CV or resume"
                      />
                    </div>
                    
                    {formData.resume_url && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/20 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">{formData.resume_name}</p>
                            <p className="text-xs text-emerald-700 dark:text-emerald-400">Resume uploaded successfully</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setFormData({...formData, resume_url: '', resume_name: ''})}
                          className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                          aria-label="Remove resume"
                        >
                          <X className="w-4 h-4 text-emerald-600" />
                        </button>
                      </div>
                    )}
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

const InputField = ({ label, placeholder, value, onChange }: any) => (
  <div className="space-y-1.5 flex-1 w-full text-left">
    <label className="text-[10px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-widest block ml-1">{label}</label>
    <input 
      type="text" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all font-semibold"
    />
  </div>
);
