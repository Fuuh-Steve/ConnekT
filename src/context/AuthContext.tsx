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

  const fetchProfile = React.useCallback(async (userId: string, currentUser?: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile not found or could not be fetched, attempting profile creation...', error.message);

        const pendingRole = localStorage.getItem('pending_role');
        const metadataRole = currentUser?.user_metadata?.role as UserRole | undefined;
        const fallbackRole = pendingRole === 'recruiter' || pendingRole === 'student'
          ? (pendingRole as UserRole)
          : metadataRole || 'student';

        const fullName = currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || null;
        const avatarUrl = currentUser?.user_metadata?.avatar_url || currentUser?.user_metadata?.picture || null;

        if (currentUser) {
          console.log('Creating or syncing profile for new user:', currentUser.email);

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
      } else if (data) {
        setRole(data.role as UserRole);
        localStorage.removeItem('pending_role');
        console.log('Fetched profile role:', data.role);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      setRole('student');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes
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

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
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
