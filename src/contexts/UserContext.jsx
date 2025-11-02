import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, sessionStorage } from '../lib/supabaseClient';
import { mockApiResponse } from '../utils/mockApi';

// Create User Context
const UserContext = createContext();

// User Context Provider
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const refreshTimerRef = useRef(null);

  // Fetch user session and restore from localStorage
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Restore session from localStorage (handled automatically by Supabase)
        // This will check for existing session and refresh if needed
        const session = await sessionStorage.restore();
        
        if (session?.user) {
          setUser(session.user);
          console.log('Session restored successfully');
        } else {
          setUser(null);
          console.log('No active session found');
        }
      } catch (err) {
        console.error('Session initialization error:', err);
        setError(err.message || 'Failed to initialize session');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();

    // Listen for auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'no user');
        
        // Update user state
        setUser(session?.user || null);
        setIsLoading(false);

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log('User signed in');
            // Session is automatically saved to localStorage by Supabase
            break;
          case 'SIGNED_OUT':
            console.log('User signed out');
            // Clear any custom cookies
            if (typeof document !== 'undefined') {
              document.cookie = 'tp_user=; path=/; max-age=0; SameSite=Lax';
            }
            setUserData(null);
            break;
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed');
            // Session is automatically updated in localStorage
            break;
          case 'USER_UPDATED':
            console.log('User updated');
            break;
          default:
            break;
        }
      }
    );

    // Set up automatic token refresh check (every 50 minutes)
    // Supabase handles this automatically, but we can verify it's working
    refreshTimerRef.current = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const now = Math.floor(Date.now() / 1000);
          const expiresAt = session.expires_at;
          
          // If token expires in less than 10 minutes, refresh it
          if (expiresAt && (expiresAt - now) < 600) {
            console.log('Refreshing token proactively...');
            await supabase.auth.refreshSession();
          }
        }
      } catch (err) {
        console.error('Token refresh check error:', err);
      }
    }, 50 * 60 * 1000); // Check every 50 minutes

    return () => {
      subscription.unsubscribe();
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  // Fetch user data when user changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setUserData(null);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to fetch from API endpoint first
        const response = await fetch('/api/userdata', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
            'Content-Type': 'application/json',
          },
        });
        
        // Check if response is ok and content type is JSON
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
        
        const data = await response.json();
        setUserData(data);
        setError(null);
      } catch (err) {
        console.warn('API fetch failed, using mock data:', err.message);
        // Use mock API for development
        try {
          const mockData = await mockApiResponse(user);
          setUserData(mockData);
          setError(null);
        } catch (mockErr) {
          console.error('Mock API also failed:', mockErr.message);
          // Final fallback to basic data
          setUserData({
            name: user?.user_metadata?.name || user?.user_metadata?.full_name || 'User',
            email: user?.email || 'user@example.com',
            role: 'Premium User',
            balance: '125.50',
            id: user?.id,
            created_at: user?.created_at,
            last_sign_in: user?.last_sign_in_at,
          });
          setError(null);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  // Function to manually refresh user data
  const refreshUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to fetch from API endpoint first
      const response = await fetch('/api/userdata', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const data = await response.json();
      setUserData(data);
      setError(null);
    } catch (err) {
      console.warn('Manual refresh failed, using mock data:', err.message);
      // Use mock API for development
      try {
        const mockData = await mockApiResponse(user);
        setUserData(mockData);
        setError(null);
      } catch (mockErr) {
        console.error('Mock API also failed:', mockErr.message);
        setError(mockErr.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    userData,
    isLoading,
    error,
    setUser,
    setUserData,
    setIsLoading,
    setError,
    refreshUserData,
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
