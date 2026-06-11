'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Briefcase, User, Settings, Zap, Mail, LogOut, Plus, ShieldCheck, CheckCircle, CreditCard } from 'lucide-react';
import { UserRole, MobileNavLinkProps } from '../types';
import { Sidebar, TopNav } from './Navigation';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { SplashLoader } from './SplashLoader';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { role, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const currentTab = pathname?.split('/')[1] || 'dashboard';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // Only show splash once per browser session, not on every page navigation
  const [isSplashing, setIsSplashing] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('connekt-splash-seen');
  });
  const mainRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    const handleScroll = () => {
      const currentScrollY = mainElement.scrollTop;
      
      // Auto-retract when scrolling down after a certain point
      if (currentScrollY > 20) {
        setIsSidebarCollapsed(true);
      } else if (currentScrollY < 10) {
        setIsSidebarCollapsed(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    mainElement.addEventListener('scroll', handleScroll);
    return () => mainElement.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isAuthPage = pathname === '/auth';

  return (
    <>
      <AnimatePresence mode="wait">
        {isSplashing && (
          <SplashLoader onComplete={() => {
            sessionStorage.setItem('connekt-splash-seen', '1');
            setIsSplashing(false);
          }} />
        )}
      </AnimatePresence>
      <div className="h-dvh w-full overflow-hidden bg-[rgb(var(--bg-main))] text-[rgb(var(--text-main))] transition-colors duration-300 font-sans selection:bg-[rgb(var(--accent))]/30 selection:text-current flex">
      {/* Simple Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(var(--accent),0.03),transparent_40%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(var(--accent),0.02),transparent_40%)]"></div>
      </div>

      {role !== 'guest' && !isAuthPage && (
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      )}
      
      <div className="flex-1 flex flex-col relative z-20 overflow-hidden">
        {!isAuthPage && (
          <TopNav 
            toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          />
        )}
        
        <main 
          ref={mainRef}
          className={cn(
            "flex-1 w-full overflow-y-auto scroll-smooth px-6 py-8 pb-32 lg:pb-10",
            isAuthPage && "h-screen p-0 max-w-none"
          )}
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>


      {/* Modern Floating Mobile Navigation */}
      {role !== 'guest' && (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-85 md:max-w-120 glass-panel rounded-2xl flex items-center px-1 py-1.5 md:px-2 md:py-2 z-100 shadow-hard border border-[rgb(var(--accent))]/40 overflow-hidden ring-1 ring-white/10 transition-all duration-300">
            <div className="absolute inset-0 bg-linear-to-t from-[rgb(var(--accent))]/10 to-transparent pointer-events-none"></div>
            
            {role === 'recruiter' ? (
              <>
                <MobileNavLink href="/dashboard" icon={LayoutDashboard} label="Home" active={currentTab === 'dashboard'} />
                <MobileNavLink href="/post" icon={Plus} label="Post" active={currentTab === 'post'} />
                <MobileNavLink href="/listings" icon={Briefcase} label="Roles" active={currentTab === 'listings'} />
                <MobileNavLink href="/pricing" icon={CreditCard} label="Plans" active={currentTab === 'pricing'} />
              </>
            ) : role === 'admin' ? (
              <>
                <MobileNavLink href="/admin" icon={ShieldCheck} label="Admin" active={currentTab === 'admin'} />
                <MobileNavLink href="/pricing" icon={CreditCard} label="Revenue" active={currentTab === 'pricing'} />
                <MobileNavLink href="/settings" icon={Settings} label="Settings" active={currentTab === 'settings'} />
              </>
            ) : (
              <>
                <MobileNavLink href="/dashboard" icon={LayoutDashboard} label="Home" active={currentTab === 'dashboard'} />
                <MobileNavLink href="/jobs" icon={Briefcase} label="Jobs" active={currentTab === 'jobs'} />
                <MobileNavLink href="/pricing" icon={CreditCard} label="Plans" active={currentTab === 'pricing'} />
                <MobileNavLink href="/profile" icon={User} label="Profile" active={currentTab === 'profile'} />
              </>
            )}

            <button 
              id="mobile-logout-btn"
              onClick={handleSignOut}
              className="relative flex-1 flex flex-col items-center justify-center gap-1 md:gap-1.5 p-1.5 md:p-2 text-red-500 rounded-xl transition-all duration-300 active:scale-95 hover:bg-red-500/10"
            >
              <LogOut className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-[9px] md:text-[11px] font-extrabold uppercase tracking-widest leading-none mt-0.5">Logout</span>
            </button>
        </div>
      )}
    </div>
    </>
  );
};

const MobileNavLink = ({ href, icon: Icon, label, active }: MobileNavLinkProps) => (
  <Link 
    href={href} 
    className={cn(
      "relative flex-1 flex flex-col items-center justify-center gap-1 md:gap-1.5 p-1.5 md:p-2 rounded-xl md:rounded-2xl transition-all duration-300 group active:scale-95",
      active ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--text-muted))]"
    )}
  >
    {active && (
      <motion.div 
        layoutId="mobile-nav-pill" 
        className="absolute inset-0 bg-[rgb(var(--accent))]/15 border border-[rgb(var(--accent))]/30 rounded-xl md:rounded-2xl shadow-inner"
      />
    )}
    <Icon className={cn("w-5 h-5 md:w-6 md:h-6 relative z-10 transition-transform duration-300", active && "scale-110")} />
    <span className={cn("text-[9px] md:text-[11px] font-extrabold uppercase tracking-widest relative z-10 transition-all duration-300 leading-none mt-0.5", 
      active ? "opacity-100 translate-y-0" : "opacity-70"
    )}>
      {label}
    </span>
  </Link>
);
