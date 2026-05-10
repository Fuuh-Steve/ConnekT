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

  // Add loading timeout to prevent infinite loading
  React.useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout - setting loading to false');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(loadingTimeout);
  }, [loading]);

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

      // Set a timeout for the profile fetch
      const profilePromise = supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      const pendingRole = localStorage.getItem('pending_role');
      const metadataRole = currentUser?.user_metadata?.role as UserRole | undefined;
      const fallbackRole = pendingRole === 'recruiter' || pendingRole === 'student'
        ? (pendingRole as UserRole)
        : metadataRole || 'student';

      console.log('[fetchProfile] pendingRole:', pendingRole, 'metadataRole:', metadataRole, 'fallbackRole:', fallbackRole);

      if (error && error.message !== 'Profile fetch timeout') {
        console.error('Profile fetch error, using fallback role:', error.message);
        setRole(fallbackRole);
        localStorage.removeItem('pending_role');
        return;
      }

      if (!data) {
        console.log('[fetchProfile] No existing profile found, using fallback role');
        setRole(fallbackRole);
        localStorage.removeItem('pending_role');
      } else {
        // Profile exists; check if we need to update it with pending_role
        const profileRole = data.role as UserRole;
        console.log('[fetchProfile] Existing profile found with role:', profileRole);

        if (pendingRole && (pendingRole === 'recruiter' || pendingRole === 'student') && pendingRole !== profileRole) {
          console.log('Updating existing profile from', profileRole, 'to', pendingRole, 'based on pending_role');

          // Non-blocking update - don't wait for it
          supabase
            .from('profiles')
            .update({ role: pendingRole })
            .eq('id', userId)
            .then(({ error: updateError }) => {
              if (updateError) {
                console.error('Failed to update profile role:', updateError);
              } else {
                console.log('[fetchProfile] Successfully updated profile role to:', pendingRole);
              }
            });
        }

        setRole(profileRole);
        localStorage.removeItem('pending_role');
        console.log('Fetched existing profile role:', profileRole);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      // Use fallback role on error
      const pendingRole = localStorage.getItem('pending_role');
      const fallbackRole = pendingRole === 'recruiter' || pendingRole === 'student'
        ? (pendingRole as UserRole)
        : 'student';
      setRole(fallbackRole);
      localStorage.removeItem('pending_role');
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

    // Get initial session with timeout
    const sessionPromise = supabase.auth.getSession();
    const sessionTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Session fetch timeout')), 3000)
    );

    Promise.race([sessionPromise, sessionTimeout])
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id, session.user);
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
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
