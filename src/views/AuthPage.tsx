'use client';

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { User, Briefcase, ChevronRight, Zap, Globe, ShieldCheck, Mail, Lock, MailCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserRole } from '../types';
import { supabase } from '../lib/supabase';

function AuthPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isLogin = searchParams.get('mode') !== 'signup';
  const selectedRole: UserRole = searchParams.get('role') === 'recruiter' ? 'recruiter' : 'student';

  const buildUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      params.set(key, value);
    }
    if (!params.get('mode')) params.set('mode', 'login');
    if (!params.get('role')) params.set('role', 'student');
    return `${pathname}?${params.toString()}`;
  };

  React.useEffect(() => {
    const mode = searchParams.get('mode');
    const role = searchParams.get('role');
    if (!mode || !role) {
      router.replace(buildUrl({}));
    }
  }, []);

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; email?: string; password?: string }>({});
  const [showEmailModal, setShowEmailModal] = useState(false);

  const mode = searchParams.get('mode');
  React.useEffect(() => {
    setError(null);
    setInfoMessage(null);
    setFieldErrors({});
  }, [mode]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    const errors: { fullName?: string; email?: string; password?: string } = {};
    if (!isLogin && fullName.trim().length < 2)
      errors.fullName = 'Full name must be at least 2 characters.';
    if (!emailRegex.test(email.trim()))
      errors.email = 'Please enter a valid email address.';
    if (!isLogin && password.length < 8)
      errors.password = 'Password must be at least 8 characters.';
    else if (isLogin && !password)
      errors.password = 'Password is required.';
    return errors;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {

      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (signInError) throw signInError;
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push('/dashboard');
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            role: selectedRole,
            full_name: fullName.trim()
          }
        }
      });
      if (signUpError) throw signUpError;

      if (data?.user && !data.session) {
        setShowEmailModal(true);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/dashboard');
    } catch (err: any) {
      let msg = err.message || 'An error occurred during authentication';
      if (msg.includes('Email rate limit exceeded')) {
        msg = 'Too many requests. Please wait a few minutes before trying again or try signing in with Google.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      localStorage.setItem('pending_role', selectedRole);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin + '/dashboard' : '',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google authentication');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative bg-[rgb(var(--bg-main))] overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[rgb(var(--accent))]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
      </div>

      <Link
        href="/"
        className="absolute top-6 sm:top-10 left-6 sm:left-10 flex items-center gap-3 text-sm sm:text-base font-bold text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))] transition-all group z-50 py-2 sm:py-0"
      >
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] flex items-center justify-center group-hover:bg-[rgb(var(--accent))] group-hover:text-white transition-all shadow-sm">
          <ChevronRight className="w-5 h-5 rotate-180" />
        </div>
        <span className="hidden sm:inline">Back to Home</span>
        <span className="sm:hidden">Back</span>
      </Link>

      <div className="max-w-4xl w-full bg-[rgb(var(--bg-main))] p-8 sm:p-10 md:p-14 rounded-[2.5rem] sm:rounded-[4rem] shadow-hard border border-[rgb(var(--border))] flex flex-col md:flex-row gap-10 sm:gap-14 mt-28 sm:mt-10 md:mt-0 relative z-10">
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-linear-to-br from-[rgb(var(--accent))] to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-[rgb(var(--accent))]/20">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[rgb(var(--text-main))] font-display leading-[1.1]">
              {isLogin ? "Welcome Back" : "Join ConnekT"}
            </h1>
            <p className="text-[rgb(var(--text-muted))] text-base sm:text-lg font-medium leading-relaxed">
              {isLogin ? "Sign in to access your dashboard and manage your tech career." : "Create your account and bridge the gap from campus to career."}
            </p>
          </div>
        </div>

        <div className="flex-[1.3] space-y-8">
          <form onSubmit={handleAuth} className="space-y-8">
            <div className="space-y-5">
              <label className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-widest ml-1">
                {isLogin ? 'Access your portal' : 'Choose your path'}
              </label>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <RoleSelectionCard
                  id="student"
                  icon={User}
                  label="Student"
                  selected={selectedRole === 'student'}
                  onClick={() => router.replace(buildUrl({ role: 'student' }))}
                />
                <RoleSelectionCard
                  id="recruiter"
                  icon={Briefcase}
                  label="Recruiter"
                  selected={selectedRole === 'recruiter'}
                  onClick={() => router.replace(buildUrl({ role: 'recruiter' }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              {infoMessage && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-700 text-sm font-bold flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <p>{infoMessage}</p>
                </div>
              )}

              {!isLogin && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[rgb(var(--text-muted))]" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); setFieldErrors(prev => ({ ...prev, fullName: undefined })); }}
                      placeholder="Full Name"
                      className={cn(
                        "w-full bg-[rgb(var(--bg-side))] border rounded-2xl py-4.5 pl-12 pr-6 text-[15px] font-medium focus:outline-none transition-all shadow-sm",
                        fieldErrors.fullName ? "border-red-500 focus:border-red-500" : "border-[rgb(var(--border))] focus:border-[rgb(var(--accent))]"
                      )}
                    />
                  </div>
                  {fieldErrors.fullName && <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1">{fieldErrors.fullName}</p>}
                </div>
              )}

              <div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[rgb(var(--text-muted))]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: undefined })); }}
                    placeholder="Email address"
                    className={cn(
                      "w-full bg-[rgb(var(--bg-side))] border rounded-2xl py-4.5 pl-12 pr-6 text-[15px] font-medium focus:outline-none transition-all shadow-sm",
                      fieldErrors.email ? "border-red-500 focus:border-red-500" : "border-[rgb(var(--border))] focus:border-[rgb(var(--accent))]"
                    )}
                  />
                </div>
                {fieldErrors.email && <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1">{fieldErrors.email}</p>}
              </div>
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[rgb(var(--text-muted))]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: undefined })); }}
                    placeholder="Password"
                    className={cn(
                      "w-full bg-[rgb(var(--bg-side))] border rounded-2xl py-4.5 pl-12 pr-6 text-[15px] focus:outline-none transition-all font-mono shadow-sm",
                      fieldErrors.password ? "border-red-500 focus:border-red-500" : "border-[rgb(var(--border))] focus:border-[rgb(var(--accent))]"
                    )}
                  />
                </div>
                {fieldErrors.password && <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1">{fieldErrors.password}</p>}
              </div>
            </div>

            <div className="space-y-5 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[rgb(var(--accent))] text-white font-bold rounded-2xl hover:bg-[rgb(var(--accent))]/90 active:scale-[0.98] transition-all shadow-xl shadow-[rgb(var(--accent))]/20 flex items-center justify-center gap-3 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{isLogin ? "Sign In" : "Create Account"}</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="relative flex items-center py-2">
                <div className="grow border-t border-[rgb(var(--border))]"></div>
                <span className="shrink mx-4 text-[11px] font-bold text-[rgb(var(--text-muted))] uppercase tracking-widest">Or</span>
                <div className="grow border-t border-[rgb(var(--border))]"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full py-4.5 bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/40 font-bold rounded-2xl flex items-center justify-center gap-4 text-base transition-all shadow-sm group"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </form>

          <div className="pt-6 border-t border-[rgb(var(--border))] text-center space-y-6">
            <p className="text-base text-[rgb(var(--text-muted))] font-bold">
              {isLogin ? (
                <>
                  New to ConnekT?{' '}
                  <button
                    type="button"
                    onClick={() => router.push(buildUrl({ mode: 'signup', role: selectedRole }))}
                    className="text-[rgb(var(--accent))] hover:underline"
                  >
                    Create a free account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => router.push(buildUrl({ mode: 'login', role: selectedRole }))}
                    className="text-[rgb(var(--accent))] hover:underline shadow-sm"
                  >
                    Sign in here
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => { setShowEmailModal(false); router.replace(buildUrl({ mode: 'login' })); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl text-center space-y-6"
            >
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-2xl bg-[rgb(var(--accent))]/10 flex items-center justify-center">
                  <MailCheck className="w-10 h-10 text-[rgb(var(--accent))]" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-[rgb(var(--text-main))]">Check your inbox</h2>
                <p className="text-[rgb(var(--text-muted))] font-medium leading-relaxed">
                  We sent a verification link to{' '}
                  <span className="text-[rgb(var(--text-main))] font-bold">{email}</span>.
                  Click the link to activate your account.
                </p>
              </div>

              <p className="text-xs text-[rgb(var(--text-muted))] font-medium">
                Can't find it? Check your spam folder.
              </p>

              <button
                onClick={() => { setShowEmailModal(false); router.replace(buildUrl({ mode: 'login' })); }}
                className="w-full py-4 bg-[rgb(var(--accent))] text-white font-bold rounded-2xl hover:bg-[rgb(var(--accent))]/90 active:scale-[0.98] transition-all shadow-lg shadow-[rgb(var(--accent))]/20"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const AuthPage = () => (
  <Suspense>
    <AuthPageInner />
  </Suspense>
);

const RoleSelectionCard = ({ icon: Icon, label, selected, onClick }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "w-full p-4 rounded-xl border transition-all flex items-center gap-3 text-left relative group",
      selected ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/5 shadow-md shadow-[rgb(var(--accent))]/5" : "border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/40 bg-[rgb(var(--bg-side))]"
    )}
  >
    <div className={cn(
      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:rotate-6",
      selected ? "bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/20" : "bg-[rgb(var(--bg-main))] text-[rgb(var(--text-muted))]"
    )}>
      <Icon className="w-5 h-5" />
    </div>
    <p className={cn("text-sm font-bold", selected ? "text-[rgb(var(--text-main))]" : "text-[rgb(var(--text-muted))]")}>{label}</p>
  </button>
);
