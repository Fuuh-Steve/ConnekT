'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, User, Lock, Eye, Globe, 
  Smartphone, Shield, Terminal, Zap,
  CheckCircle, ChevronRight, Save, Trash2, Mail, CreditCard,
  Moon, Sun, Laptop, LogOut, Loader2, LucideIcon, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '../lib/utils';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { UserProfile, SectionProps, SettingInputProps, ToggleSettingProps } from '../types';

type SettingsTab = 'General' | 'Profile' | 'Notifications' | 'Security' | 'Billing';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('General');
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    // In a real app, we would gather form data and update Supabase here
    setTimeout(() => setIsSaving(false), 1500);
  };

  const tabs: { id: SettingsTab; icon: LucideIcon }[] = [
    { id: 'General', icon: Laptop },
    { id: 'Profile', icon: User },
    { id: 'Notifications', icon: Bell },
    { id: 'Security', icon: Shield },
    { id: 'Billing', icon: CreditCard },
  ];

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-[rgb(var(--accent))] animate-spin" />
        <p className="text-[rgb(var(--text-muted))] font-bold uppercase tracking-widest text-xs">Loading Settings...</p>
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  const lastName = profile?.full_name?.split(' ').slice(1).join(' ') || '';

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-[rgb(var(--text-main))]">Settings</h1>
          <p className="text-[rgb(var(--text-muted))]">Manage your account preferences and system configurations.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-3 bg-[rgb(var(--accent))] text-white font-bold rounded-xl shadow-lg shadow-[rgb(var(--accent))]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <aside className="md:col-span-1 space-y-2">
           {tabs.map((tab) => (
             <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-bold transition-all uppercase tracking-wider",
                activeTab === tab.id 
                  ? "bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] shadow-sm border border-[rgb(var(--accent))]/20" 
                  : "text-[rgb(var(--text-muted))] hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-[rgb(var(--text-main))]"
              )}
             >
                <tab.icon className="w-4 h-4" />
                {tab.id}
             </button>
           ))}
        </aside>

        {/* Content Area */}
        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {activeTab === 'General' && (
                <div className="space-y-8">
                  <AppearanceSection />
                  <SystemSection />
                </div>
              )}

              {activeTab === 'Profile' && (
                <div className="space-y-8">
                  <Section title="Personal Information" subtitle="Update your basic account details.">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <SettingInput label="First Name" defaultValue={firstName} />
                       <SettingInput label="Last Name" defaultValue={lastName} />
                       <div className="sm:col-span-2">
                          <SettingInput label="Professional Role" defaultValue={profile?.bio || "Professional Developer"} />
                       </div>
                    </div>
                  </Section>

                  <Section title="Contact Details" subtitle="How recruiters can reach you.">
                    <div className="space-y-6">
                       <SettingInput label="Email Address" defaultValue={user?.email || "user@example.com"} icon={Mail} />
                       <SettingInput label="Phone Number" defaultValue={profile?.phone || "Not set"} />
                    </div>
                  </Section>
                </div>
              )}

              {activeTab === 'Notifications' && (
                <div className="space-y-8">
                  <NotificationsSection />
                </div>
              )}

              {activeTab === 'Security' && (
                <div className="space-y-8">
                  <SecuritySection />
                </div>
              )}

              {activeTab === 'Billing' && (
                <div className="space-y-8">
                  <BillingSection />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// ... Rest of sub-components (Section, SettingInput, ToggleSetting, etc.)
// Keeping the rest as they are but wrapping some in components for cleaner code if needed
// or just export them.

const AppearanceSection = () => (
  <Section title="Appearance" subtitle="Customize the interface look and feel.">
     <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-[rgb(var(--bg-side))] rounded-xl border border-[rgb(var(--border))]">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
                <Sun className="w-5 h-5" />
             </div>
             <div>
               <p className="font-bold text-sm">Theme Mode</p>
               <p className="text-xs text-[rgb(var(--text-muted))]">Switch between light and dark themes.</p>
             </div>
          </div>
          <ThemeToggle />
        </div>

        <ToggleSetting 
          icon={Terminal} 
          title="Developer Mode" 
          desc="Enable experimental features and debug logs." 
          defaultChecked={false} 
        />
     </div>
  </Section>
);

const SystemSection = () => (
  <Section title="System" subtitle="Global application behaviors.">
     <div className="space-y-4">
        <ToggleSetting 
          icon={Globe} 
          title="Language" 
          desc="Default system language." 
          value="English (US)"
        />
        <ToggleSetting 
          title="Auto-Save" 
          desc="Automatically save changes while editing documents." 
          defaultChecked={true} 
        />
     </div>
  </Section>
);

const NotificationsSection = () => (
  <div className="space-y-8">
    <Section title="Email Notifications" subtitle="Decide what messages arrive in your inbox.">
      <div className="space-y-4">
         <ToggleSetting title="Job Alerts" desc="Summary of new internships matching your preferences." defaultChecked={true} />
         <ToggleSetting title="Application Updates" desc="Instant news about your submission status." defaultChecked={true} />
         <ToggleSetting title="Newsletter" desc="Weekly insights and career growth tips." defaultChecked={false} />
      </div>
    </Section>

    <Section title="Push Notifications" subtitle="Real-time alerts via browser.">
      <div className="space-y-4">
         <ToggleSetting title="Direct Messages" desc="Alerts when a recruiter messsages you." defaultChecked={true} />
         <ToggleSetting title="Dashboard Highlights" desc="Daily summary of interaction stats." defaultChecked={true} />
      </div>
    </Section>
  </div>
);

const SecuritySection = () => {
  const { user, signOut, session } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDeleteAccount = async () => {
    if (!user || confirmEmail !== user.email) return;

    try {
      setIsDeleting(true);
      setErrorMsg('');

      const token = session?.access_token;
      if (!token) {
        throw new Error('No active session token found');
      }

      // Call server-side API which uses the Supabase service role key to delete the user
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to delete account');
      }

      // Sign out and redirect to home
      await signOut();
      router.push('/');
    } catch (err: any) {
      console.error('Error deleting account:', err);
      setErrorMsg(err.message || 'Failed to delete account. Please try again later.');
      setIsDeleting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setConfirmEmail('');
    setErrorMsg('');
  };

  return (
    <div className="space-y-8">
      <Section title="Account Security" subtitle="Manage passwords and verification.">
        <div className="space-y-4">
           <button className="w-full flex items-center justify-between p-5 bg-[rgb(var(--bg-side))] rounded-2xl border border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/30 transition-all group">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[rgb(var(--text-muted))]">
                  <Lock className="w-5 h-5" />
               </div>
               <div className="text-left">
                 <p className="font-bold text-sm">Change Password</p>
                 <p className="text-xs text-[rgb(var(--text-muted))]">Last updated 3 months ago.</p>
               </div>
             </div>
             <ChevronRight className="w-5 h-5 text-[rgb(var(--text-muted))] group-hover:translate-x-1 transition-all" />
           </button>

           <button className="w-full flex items-center justify-between p-5 bg-[rgb(var(--bg-side))] rounded-2xl border border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/30 transition-all group">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Shield className="w-5 h-5" />
               </div>
               <div className="text-left">
                 <p className="font-bold text-sm">Two-Factor Auth</p>
                 <p className="text-xs text-emerald-600 font-bold">Enabled via SMS</p>
               </div>
             </div>
             <CheckCircle className="w-5 h-5 text-emerald-500" />
           </button>
        </div>
      </Section>

      <Section title="Danger Zone" subtitle="Irreversible account actions.">
         <button 
           onClick={() => setIsModalOpen(true)}
           className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all active:scale-95"
         >
            <Trash2 className="w-4 h-4" />
            Delete Account Permanently
         </button>
      </Section>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-[rgb(var(--bg-main))] rounded-3xl border border-[rgb(var(--border))] shadow-2xl overflow-hidden relative p-8 space-y-6"
            >
              <button
                onClick={closeModal}
                aria-label="Close modal"
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-2 text-center sm:text-left">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto sm:mx-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[rgb(var(--text-main))] pt-2">Delete your account?</h3>
                <p className="text-sm text-[rgb(var(--text-muted))] leading-relaxed">
                  This action is <strong>irreversible</strong> and will permanently delete all profile settings, resume files, job listings, and applications.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-bold text-red-500">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--text-muted))] ml-1">
                  Type your email to confirm: <span className="font-mono text-red-500 select-all">{user?.email}</span>
                </label>
                <input
                  type="text"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder={user?.email || "your.email@example.com"}
                  className="w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-red-500 transition-all font-semibold"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={closeModal}
                  disabled={isDeleting}
                  className="flex-1 py-3 border border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-side))] rounded-xl font-bold text-sm transition-all text-[rgb(var(--text-main))]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || confirmEmail !== user?.email}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Account"
                  )}
                </button>
              </div>
            </motion.div>
            <div className="absolute inset-0 -z-10" onClick={closeModal}></div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BillingSection = () => (
  <div className="space-y-8">
    <Section title="Subscription Plan" subtitle="Manage your current membership.">
      <div className="p-6 bg-linear-to-br from-blue-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-blue-600/20">
        <div className="flex items-start justify-between">
           <div>
              <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/30">Current Plan</span>
              <h3 className="text-3xl font-bold mt-4">Pro Membership</h3>
              <p className="text-blue-100/80 text-sm mt-1">Unlimited applications & priority support.</p>
           </div>
           <Zap className="w-12 h-12 text-blue-200 opacity-50" />
        </div>
        <div className="mt-8 flex items-center justify-between border-t border-white/20 pt-6">
           <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">XAF 5,000</span>
              <span className="text-sm opacity-60">/month</span>
           </div>
           <button className="px-6 py-2 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all">
              Manage Billing
           </button>
        </div>
      </div>
    </Section>
  </div>
);

const Section = ({ title, subtitle, children }: SectionProps) => (
  <section className="bg-[rgb(var(--bg-main))] p-8 rounded-2xl border border-[rgb(var(--border))] space-y-6 shadow-sm">
    <div className="space-y-1">
      <h2 className="text-xl font-bold text-[rgb(var(--text-main))]">{title}</h2>
      <p className="text-xs font-medium text-[rgb(var(--text-muted))]">{subtitle}</p>
    </div>
    <div className="pt-2">{children}</div>
  </section>
);

const SettingInput = ({ label, defaultValue, icon: Icon }: SettingInputProps) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--text-muted))] ml-1">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-muted))]" />}
      <input 
        type="text" 
        aria-label={label}
        defaultValue={defaultValue}
        className={cn(
          "w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[rgb(var(--accent))] transition-all font-semibold",
          Icon && "pl-11"
        )}
      />
    </div>
  </div>
);

const ToggleSetting = ({ icon: Icon, title, desc, defaultChecked, value }: ToggleSettingProps) => (
  <div className="flex items-center justify-between p-4 bg-[rgb(var(--bg-side))] rounded-xl border border-[rgb(var(--border))] group">
    <div className="flex items-center gap-4">
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--accent))] transition-colors">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div>
        <p className="font-bold text-sm text-[rgb(var(--text-main))]">{title}</p>
        <p className="text-xs text-[rgb(var(--text-muted))]">{desc}</p>
      </div>
    </div>
    
    {value ? (
       <div className="px-4 py-1.5 bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-lg text-xs font-bold font-mono">
          {value}
       </div>
    ) : (
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" aria-label={title} className="sr-only peer" defaultChecked={defaultChecked} />
        <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(var(--accent))]"></div>
      </label>
    )}
  </div>
);
