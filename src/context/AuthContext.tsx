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
        console.error('Profile not found, checking for pending registration...', error.message);
        
        // Handle OAuth signup where role is in localStorage
        const pendingRole = localStorage.getItem('pending_role');
        
        if (pendingRole && (pendingRole === 'student' || pendingRole === 'recruiter') && currentUser) {
          const fullName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name;
          const avatarUrl = currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture;
          
          console.log('Creating profile for Google user:', currentUser.email);

          // Use upsert instead of update to ensure record exists for OAuth
          const { error: upsertError } = await supabase.from('profiles').upsert({ 
            id: userId,
            role: pendingRole,
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

          setRole(pendingRole as UserRole);
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
