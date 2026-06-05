'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>('guest');
  const [loading, setLoading] = useState(true);

  const INACTIVE_SIGNOUT_TIME = 1000 * 60 * 30; // 30 minutes
  const HIDDEN_TIMESTAMP_KEY = 'connekt-hidden-timestamp';
  const hiddenTimeoutRef = React.useRef<number | null>(null);

  const clearHiddenSignOutTimeout = () => {
    if (hiddenTimeoutRef.current !== null) {
      window.clearTimeout(hiddenTimeoutRef.current);
      hiddenTimeoutRef.current = null;
    }
  };

  const shouldSignOutAfterHidden = () => {
    const lastHidden = localStorage.getItem(HIDDEN_TIMESTAMP_KEY);
    return lastHidden ? Date.now() - Number(lastHidden) > INACTIVE_SIGNOUT_TIME : false;
  };

  const signOutSupabase = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Supabase sign-out failed, clearing local auth state instead:', error);
      localStorage.removeItem(HIDDEN_TIMESTAMP_KEY);
    }
  };

  const performSignOut = async () => {
    clearHiddenSignOutTimeout();
    localStorage.removeItem(HIDDEN_TIMESTAMP_KEY);
    await signOutSupabase();
  };

  const scheduleHiddenSignOut = () => {
    clearHiddenSignOutTimeout();
    hiddenTimeoutRef.current = window.setTimeout(async () => {
      localStorage.setItem(HIDDEN_TIMESTAMP_KEY, Date.now().toString());
      await signOutSupabase();
    }, INACTIVE_SIGNOUT_TIME);
  };

  const handleVisibilityChange = async () => {
    if (document.hidden) {
      localStorage.setItem(HIDDEN_TIMESTAMP_KEY, Date.now().toString());
      scheduleHiddenSignOut();
    } else {
      clearHiddenSignOutTimeout();
      if (shouldSignOutAfterHidden()) {
        localStorage.removeItem(HIDDEN_TIMESTAMP_KEY);
        await signOutSupabase();
      } else {
        localStorage.removeItem(HIDDEN_TIMESTAMP_KEY);
      }
    }
  };

  const fetchProfile = React.useCallback(async (userId: string, currentUser?: User) => {
    try {
      console.log('[fetchProfile] Starting for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      const pendingRole = localStorage.getItem('pending_role');
      const metadataRole = currentUser?.user_metadata?.role as UserRole | undefined;
      const fallbackRole = pendingRole === 'recruiter' || pendingRole === 'student'
        ? (pendingRole as UserRole)
        : metadataRole || 'student';

      console.log('[fetchProfile] pendingRole:', pendingRole, 'metadataRole:', metadataRole, 'fallbackRole:', fallbackRole);

      if (error) {
        console.error('Profile fetch error, attempting profile creation or sync...', error.message);
      }

      if (!data) {
        console.log('[fetchProfile] No existing profile found, creating new one');
        if (currentUser) {
          const fullName = currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || null;
          const avatarUrl = currentUser?.user_metadata?.avatar_url || currentUser?.user_metadata?.picture || null;

          console.log('Creating profile for new user:', currentUser.email, 'with role', fallbackRole);

          const { error: upsertError } = await supabase.from('profiles').upsert({
            id: userId,
            role: fallbackRole,
            email: currentUser.email,
            full_name: fullName,
            avatar_url: avatarUrl
          }, { onConflict: 'id' });

          if (upsertError) {
            console.error('FAILED TO CREATE PROFILE:', upsertError);
            if (upsertError.code === '42501' || upsertError.message.includes('permission denied')) {
              console.error('RLS POLICY ERROR: You must add the UPDATE policy to the profiles table in Supabase.');
              throw new Error('Database access denied (403). Please ensure your Supabase RLS policies allow for UPDATE on the profiles table.');
            }
            throw upsertError;
          }

          setRole(fallbackRole);
          localStorage.removeItem('pending_role');
        } else {
          setRole('student');
        }
      } else {
        const profileRole = data.role as UserRole;
        setRole(profileRole);
        localStorage.removeItem('pending_role');
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      setRole('student');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const runInitialHiddenCheck = async () => {
      if (shouldSignOutAfterHidden()) {
        await signOutSupabase();
      }
    };

    runInitialHiddenCheck();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user);
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      console.warn('Error getting Supabase session:', error);
      setLoading(false);
    });

    // Listen for visibility changes so inactive background users get logged out
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setSession(session);
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id, currentUser);
      } else {
        setRole('guest');
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearHiddenSignOutTimeout();
    };
  }, [fetchProfile]);

  const signOut = async () => {
    clearHiddenSignOutTimeout();
    localStorage.removeItem(HIDDEN_TIMESTAMP_KEY);
    await signOutSupabase();
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
