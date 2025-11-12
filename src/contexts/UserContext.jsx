import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Create User Context
const UserContext = createContext();

/**
 * UserProvider - Manages authentication state and user data
 * 
 * SECURITY IMPROVEMENTS:
 * - Removed exposed setters (setUser, setUserData, setIsLoading, setError)
 * - Single source of truth for session management
 * - Proper dependency arrays to prevent infinite loops
 * - Automatic token refresh handled by Supabase
 */
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect 1: Initialize session and set up auth state listener
  // This runs ONLY ONCE when the component mounts
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get the current session (automatically restored from localStorage by Supabase)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            setError(sessionError.message);
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        if (session?.user) {
          console.log('Session restored successfully:', session.user.email);
          if (mounted) {
            setUser(session.user);
          }
        } else {
          console.log('No active session found');
          if (mounted) {
            setUser(null);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err);
        if (mounted) {
          setError(err.message || 'Failed to initialize session');
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        if (!mounted) return;

        const currentUser = session?.user || null;
        setUser(currentUser);

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log('User signed in:', currentUser?.email);
            break;
          
          case 'SIGNED_OUT':
            console.log('User signed out');
            setUserData(null);
            setError(null);
            break;
          
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed successfully');
            break;
          
          case 'USER_UPDATED':
            console.log('User data updated');
            break;
          
          default:
            break;
        }

        // Set loading to false after any auth event
        setIsLoading(false);
      }
    );

    // Cleanup function
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - runs only once on mount

  // Effect 2: Fetch user profile data when user changes
  // This depends ONLY on user.id to prevent unnecessary refetches
  useEffect(() => {
    let mounted = true;

    const fetchUserData = async () => {
      // If no user, clear data and return
      if (!user?.id) {
        if (mounted) {
          setUserData(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        // Fetch user profile from database
        const { data, error: fetchError } = await supabase
          .from('data_user')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fetchError) {
          // If profile doesn't exist (PGRST116 error), create fallback data
          if (fetchError.code === 'PGRST116') {
            console.warn('No profile found for user, using fallback data');
            if (mounted) {
              setUserData({
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || user.user_metadata?.full_name || 'User',
                prename: user.user_metadata?.prename || '',
                role: 'user',
                terms: false,
                created_at: user.created_at,
                points: 0,
              });
            }
          } else {
            throw fetchError;
          }
        } else {
          // Profile found successfully
          console.log('User profile loaded successfully');
          if (mounted) {
            setUserData(data);
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      mounted = false;
    };
  }, [user?.id]); // Only depends on user.id - stable and efficient

  // Function to manually refresh user data (e.g., after profile update)
  const refreshUserData = async () => {
    if (!user?.id) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('data_user')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      setUserData(data);
      setError(null);
    } catch (err) {
      console.error('Error refreshing user data:', err);
      setError(err.message);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state
      setUser(null);
      setUserData(null);
      setError(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err.message);
    }
  };

  // Context value - ONLY expose what's needed, no setters
  const value = {
    user,
    userData,
    isLoading,
    error,
    refreshUserData,
    signOut,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use user context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;
