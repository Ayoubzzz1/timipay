import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { mockApiResponse } from '../utils/mockApi';

// Create User Context
const UserContext = createContext();

// User Context Provider
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user session
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setError(error.message);
        } else {
          setUser(session?.user || null);
        }
      } catch (err) {
        console.error('Session error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
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
