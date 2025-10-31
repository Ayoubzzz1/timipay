import { useUser } from '../contexts/UserContext';

/**
 * Custom hook to access user session credentials and data
 * This hook provides easy access to user session information throughout the application
 * 
 * @returns {Object} User session data and utilities
 * @returns {Object} user - Supabase user object with authentication data
 * @returns {Object} userData - Extended user data from API
 * @returns {boolean} isLoading - Loading state for user data
 * @returns {string|null} error - Error message if any
 * @returns {Object} session - Complete session information
 * @returns {Function} refreshUserData - Function to refresh user data
 */
export function useUserSession() {
  const { user, userData, isLoading, error, refreshUserData } = useUser();

  // Create a comprehensive session object
  const session = {
    // Authentication data
    isAuthenticated: !!user,
    userId: user?.id,
    email: user?.email,
    emailVerified: user?.email_confirmed_at,
    
    // User metadata
    name: user?.user_metadata?.name || user?.user_metadata?.full_name || userData?.name,
    avatar: user?.user_metadata?.avatar_url,
    provider: user?.app_metadata?.provider,
    
    // Extended user data
    role: userData?.role,
    balance: userData?.balance,
    createdAt: user?.created_at,
    lastSignIn: user?.last_sign_in_at,
    
    // Session tokens
    accessToken: user?.access_token,
    refreshToken: user?.refresh_token,
    
    // Status
    isLoading,
    error,
  };

  // Function to refresh user data is now provided by the context

  // Function to check if user has specific role
  const hasRole = (role) => {
    return userData?.role === role;
  };

  // Function to check if user has minimum balance
  const hasMinimumBalance = (amount) => {
    const balance = parseFloat(userData?.balance || '0');
    return balance >= amount;
  };

  return {
    user,
    userData,
    session,
    isLoading,
    error,
    refreshUserData,
    hasRole,
    hasMinimumBalance,
  };
}

export default useUserSession;
