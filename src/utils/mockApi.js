// Mock API endpoint for development
// This file can be used to simulate the /api/userdata endpoint during development

export const mockUserData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'Premium User',
  balance: '125.50',
  id: 'mock-user-id',
  created_at: '2024-01-01T00:00:00Z',
  last_sign_in: '2024-01-15T10:30:00Z',
  avatar: null,
  preferences: {
    theme: 'light',
    notifications: true,
    language: 'en'
  },
  stats: {
    totalEarnings: 250.75,
    totalWithdrawals: 125.25,
    videosWatched: 45,
    referrals: 3
  }
};

// Function to simulate API delay
export const simulateApiDelay = (ms = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Function to simulate API response
export const mockApiResponse = async (user) => {
  await simulateApiDelay(500); // Simulate network delay
  
  if (!user || !user.access_token) {
    throw new Error('Unauthorized');
  }
  
  // Return user data based on the authenticated user
  return {
    ...mockUserData,
    name: user.user_metadata?.name || user.user_metadata?.full_name || mockUserData.name,
    email: user.email || mockUserData.email,
    id: user.id || mockUserData.id,
    created_at: user.created_at || mockUserData.created_at,
    last_sign_in: user.last_sign_in_at || mockUserData.last_sign_in,
  };
};












