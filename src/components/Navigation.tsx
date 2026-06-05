'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Briefcase, User, ShieldCheck, 
  Search, Bell, Settings, LogOut, Plus, Globe, 
  ChevronRight, Menu, X, CreditCard, CheckCircle,
  Mail, MapPin, Zap
} from 'lucide-react';
import { UserRole, NavItem, ProfileMenuItemProps } from '../types';
import { cn } from '../lib/utils';
import { ThemeToggle } from './ThemeToggle';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const Sidebar = ({ isCollapsed, toggleCollapse }: { isCollapsed: boolean, toggleCollapse: () => void }) => {
  const { role, signOut } = useAuth();
  const pathname = usePathname();
  const currentTab = pathname?.split('/')[1] || 'dashboard';
  
  const navItems: Record<UserRole, NavItem[]> = {
    student: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { id: 'jobs', label: 'Browse Internships', icon: Briefcase, path: '/jobs' },
      { id: 'profile', label: 'My Profile', icon: User, path: '/profile' },
      { id: 'pricing', label: 'Billing/Plans', icon: CreditCard, path: '/pricing' },
    ],
    recruiter: [
      { id: 'dashboard', label: 'Company Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { id: 'post', label: 'Post Internship', icon: Plus, path: '/post' },
      { id: 'listings', label: 'Manage Roles', icon: Briefcase, path: '/listings' },
      { id: 'pricing', label: 'Billing/Plans', icon: CreditCard, path: '/pricing' },
    ],
    admin: [
      { id: 'admin', label: 'Admin Dashboard', icon: ShieldCheck, path: '/admin' },
      { id: 'pricing', label: 'Revenue', icon: CreditCard, path: '/pricing' },
      { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    ],
    guest: [
       { id: 'jobs', label: 'Explore Jobs', icon: Briefcase, path: '/jobs' },
       { id: 'pricing', label: 'Plans', icon: CreditCard, path: '/pricing' },
    ]
  };

  const router = useRouter();
  const items = navItems[role] || navItems.guest;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <aside className={cn(
      "border-r border-[rgb(var(--border))] h-screen sticky top-0 hidden lg:flex flex-col bg-[rgb(var(--bg-side))] transition-all duration-300 z-40 overflow-hidden",
      isCollapsed ? "w-20 p-4" : "w-70 p-6"
    )}>
      <Link href="/" className={cn(
        "flex items-center gap-2 group relative z-10",
        isCollapsed ? "mb-16 justify-center" : "mb-10 px-2"
      )}>
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[rgb(var(--accent))] to-blue-600 flex items-center justify-center shadow-lg shadow-[rgb(var(--accent))]/20 transition-transform group-hover:scale-105 shrink-0">
          <Zap className="w-6 h-6 text-white" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight leading-none text-[rgb(var(--text-main))]">ConnekT</span>
            {/* <span className="text-[10px] text-[rgb(var(--text-muted))] uppercase tracking-wider font-semibold">Scale</span> */}
          </div>
        )}
      </Link>
 
      {/* Collapse Toggle Arrow - Refined position */}
      <button 
        onClick={toggleCollapse}
        className={cn(
          "absolute w-8 h-8 bg-[rgb(var(--accent))] text-white rounded-lg flex items-center justify-center z-70 shadow-xl hover:scale-110 active:scale-95 transition-all group/toggle",
          isCollapsed ? "left-1/2 -translate-x-1/2 top-20" : "-right-4 top-20"
        )}
      >
        <ChevronRight className={cn("w-4 h-4 transition-transform duration-300", isCollapsed ? "rotate-0" : "rotate-180")} />
      </button>

      <nav className="flex-1 space-y-1 relative z-10">
        {!isCollapsed && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--text-muted))] mb-4 ml-2 opacity-50">Menu</p>
        )}
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.path || `/${item.id}`}
            title={isCollapsed ? item.label : ""}
            className={cn(
              "flex items-center gap-3 rounded-xl transition-all duration-200 group relative",
              isCollapsed ? "p-3 justify-center" : "px-4 py-3",
              currentTab === (item.id.includes('/') ? item.id : item.id) 
                ? "bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] font-semibold" 
                : "text-[rgb(var(--text-muted))] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[rgb(var(--text-main))]"
            )}
          >
            {currentTab === item.id && (
                <motion.div 
                  layoutId="nav-pill"
                  className="absolute -left-0.5 w-1 h-5 bg-[rgb(var(--accent))] rounded-r-full"
                />
            )}
            <item.icon className={cn("w-5 h-5 transition-colors shrink-0", currentTab === item.id ? "text-[rgb(var(--accent))]" : "group-hover:text-[rgb(var(--accent))]")} />
            {!isCollapsed && <span className="text-sm truncate">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className={cn(
        "mt-auto space-y-1 pt-6 border-t border-[rgb(var(--border))] relative z-10",
        isCollapsed ? "items-center" : ""
      )}>
        <Link 
          href="/settings" 
          title={isCollapsed ? "Settings" : ""}
          className={cn(
            "flex items-center gap-3 w-full text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-main))] transition-all duration-200 group rounded-xl hover:bg-black/5 dark:hover:bg-white/5",
            isCollapsed ? "p-3 justify-center" : "px-4 py-3"
          )}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
        </Link>
        <button 
          onClick={handleSignOut}
          title={isCollapsed ? "Logout" : ""}
          className={cn(
            "flex items-center gap-3 w-full text-red-500 hover:text-red-600 transition-all duration-200 font-medium rounded-xl hover:bg-red-500/5 group",
            isCollapsed ? "p-3 justify-center" : "px-4 py-3"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
};


export const TopNav = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { user, role, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setProfile(data);
        setAvatar(data.avatar_url);
      }
    };
    fetchProfile();

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    
    const handleProfileUpdate = () => {
      fetchProfile();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('profile_updated', handleProfileUpdate);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('profile_updated', handleProfileUpdate);
    };
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const displayUsername = profile?.username ? `@${profile.username}` : (user?.email?.split('@')[0] || 'Member');

  const ROLE_NAMES: Record<UserRole, string> = {
    student: 'Student',
    recruiter: 'Recruiter',
    admin: 'Administrator',
    guest: 'Guest'
  };

  return (
    <header className="h-20 border-b border-[rgb(var(--border))] px-4 sm:px-6 md:px-10 flex items-center justify-between sticky top-0 bg-[rgb(var(--bg-main))]/90 backdrop-blur-md z-60 transition-all">
      <div className="flex items-center gap-2.5 mr-4">
         <Link href="/" className="flex items-center gap-2.5 group shrink-0">
           <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[1.25rem] bg-linear-to-br from-[rgb(var(--accent))] to-blue-600 flex items-center justify-center shadow-lg shadow-[rgb(var(--accent))]/20 transition-transform group-hover:scale-105">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
           </div>
           <span className="font-bold text-xl sm:text-2xl tracking-tight text-[rgb(var(--text-main))] text-left leading-none">ConnekT</span>
         </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        {role === 'guest' && (
          <div className="hidden sm:flex items-center bg-[rgb(var(--bg-side))] p-1 rounded-xl border border-[rgb(var(--border))] mr-2">
            <Link
              href="/auth?mode=signup"
              className={cn(
                "px-5 py-2 text-[12px] font-extrabold rounded-lg transition-all uppercase tracking-widest bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/20 hover:scale-105 active:scale-95",
                pathname === '/auth' && "ring-2 ring-white/20"
              )}
            >
              Sign Up
            </Link>
            <div className="w-px h-4 bg-[rgb(var(--border))] mx-1"></div>
            <Link
              href="/auth"
              className={cn(
                "px-5 py-2 text-[12px] font-bold rounded-lg transition-all uppercase tracking-wider",
                pathname === '/auth' ? "bg-[rgb(var(--bg-main))] text-[rgb(var(--accent))] shadow-sm" : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-main))]"
              )}
            >
              Sign In
            </Link>
          </div>
        )}

        {role !== 'guest' ? (
          <div className="relative w-full max-w-sm group hidden xl:block mr-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--text-muted))]" />
            <input 
              type="text" 
              placeholder="Search everything..." 
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                  router.push(`/jobs?search=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
                }
              }}
              className="w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-2xl py-3 pl-12 pr-4 text-base focus:outline-none focus:border-[rgb(var(--accent))] shadow-sm transition-all"
            />
          </div>
        ) : null}

        <div className="flex items-center">
            <ThemeToggle />
        </div>

        {/* Notifications */}
        {role !== 'guest' && (
          <div className="relative" ref={notifRef}>
              <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={cn(
                "p-3 bg-[rgb(var(--bg-side))] rounded-2xl border border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-main))] transition-all relative",
                isNotifOpen && "border-[rgb(var(--accent))] text-[rgb(var(--accent))] bg-[rgb(var(--accent))]/5"
              )}
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[rgb(var(--bg-main))]"></span>
            </button>
  
            <AnimatePresence>
              {isNotifOpen && (
                <>
                  {/* Mobile Backdrop for Notifications */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsNotifOpen(false)}
                    className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[-1] lg:hidden"
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="fixed sm:absolute right-4 sm:right-0 top-[80px] sm:top-[calc(100%+12px)] left-4 sm:left-auto w-auto sm:w-80 bg-[rgb(var(--bg-main))] shadow-hard border border-[rgb(var(--border))] rounded-2xl p-4 sm:p-6 z-100 origin-top sm:origin-top-right"
                  >
                    <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Notifications</h3>
                    <span className="text-[10px] bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] px-2 py-0.5 rounded-full font-bold">3 NEW</span>
                  </div>
                  <div className="space-y-1">
                    {[
                      { icon: Mail, title: 'Interview Invite', desc: 'Google sent an invite', time: '2m ago' },
                      { icon: Zap, title: 'Job Match', desc: '98% compatibility with Meta', time: '1h ago' },
                      { icon: CheckCircle, title: 'Verified', desc: 'Skills assessment complete', time: '3h ago' }
                    ].map((notif, i) => (
                      <div key={i} className="flex gap-4 p-3 hover:bg-[rgb(var(--bg-side))] rounded-xl cursor-pointer transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-[rgb(var(--bg-side))] flex items-center justify-center shrink-0 border border-[rgb(var(--border))]">
                          <notif.icon className="w-5 h-5 text-[rgb(var(--accent))]" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold">{notif.title}</p>
                          <p className="text-xs text-[rgb(var(--text-muted))]">{notif.desc}</p>
                          <p className="text-[10px] text-[rgb(var(--text-muted))] mt-1">{notif.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 py-2.5 text-xs font-semibold text-[rgb(var(--accent))] hover:bg-[rgb(var(--accent))]/5 rounded-xl transition-colors">
                    View all notifications
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}
        
        {/* Profile */}
        {role !== 'guest' ? (
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-4 pl-6 border-l border-[rgb(var(--border))] group transition-all"
            >
              <div className="text-right hidden sm:block">
                <p className="text-base font-bold leading-none text-[rgb(var(--text-main))] group-hover:text-[rgb(var(--accent))] transition-colors">{displayName}</p>
                <p className="text-[11px] text-[rgb(var(--text-muted))] font-bold mt-1.5 uppercase tracking-tight">{ROLE_NAMES[role]}</p>
              </div>
              <div className={cn(
                "w-12 h-12 rounded-2xl bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] p-1 flex items-center justify-center overflow-hidden group-hover:border-[rgb(var(--accent))]/50 transition-all shadow-sm",
                isProfileOpen && "border-[rgb(var(--accent))] ring-4 ring-[rgb(var(--accent))]/10"
              )}>
                 {avatar ? (
                   <Image 
                    src={avatar} 
                    alt="Avatar" 
                    referrerPolicy="no-referrer"
                    width={40}
                    height={40}
                    className="w-full h-full rounded-lg object-cover"
                   />
                 ) : (
                   <User className="w-6 h-6 text-[rgb(var(--text-muted))]" />
                 )}
              </div>
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-[calc(100%+12px)] w-60 bg-[rgb(var(--bg-main))] shadow-hard border border-[rgb(var(--border))] rounded-2xl p-2 z-70 origin-top-right overflow-hidden"
                >
                  <div className="p-4 border-b border-[rgb(var(--border))] mb-1">
                    <p className="text-sm font-bold truncate">{displayName}</p>
                    <p className="text-[10px] text-[rgb(var(--text-muted))] font-bold uppercase tracking-widest mt-1 truncate">{displayUsername}</p>
                  </div>
                  <div className="space-y-0.5">
                    <ProfileMenuItem icon={User} label="Profile" onClick={() => { router.push('/profile'); setIsProfileOpen(false); }} />
                    <ProfileMenuItem icon={Settings} label="Settings" onClick={() => { router.push('/settings'); setIsProfileOpen(false); }} />
                    <div className="h-px bg-[rgb(var(--border))] my-1 mx-2"></div>
                    <ProfileMenuItem icon={LogOut} label="Sign Out" onClick={handleLogout} isDanger />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="sm:hidden">
            <Link href="/auth" className="p-2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-main))] transition-colors">
              <User className="w-6 h-6" />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};


const ProfileMenuItem = ({ icon: Icon, label, onClick, isDanger }: ProfileMenuItemProps) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all group",
      isDanger ? "hover:bg-red-50 dark:hover:bg-red-900/10" : "hover:bg-[rgb(var(--bg-side))]"
    )}
  >
    <div className={cn(
      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors border border-[rgb(var(--border))]",
      isDanger ? "text-red-500 bg-red-50 dark:bg-red-900/10 group-hover:bg-red-500 group-hover:text-white" : "bg-[rgb(var(--bg-side))] group-hover:text-[rgb(var(--accent))]"
    )}>
      <Icon className="w-4 h-4" />
    </div>
    <span className={cn(
      "text-sm font-bold tracking-tight transition-colors",
      isDanger ? "text-red-500" : "text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--text-main))]"
    )}>{label}</span>
    <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
  </button>
);


