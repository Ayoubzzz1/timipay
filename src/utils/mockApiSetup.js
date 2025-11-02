// Development API mock for Vite
// This file provides a mock API endpoint during development

import { mockApiResponse } from '../utils/mockApi';

export function setupMockApi() {
  // Only run in development
  if (import.meta.env.DEV) {
    // Mock the fetch for /api/userdata endpoint
    const originalFetch = window.fetch;
    
    window.fetch = async (url, options) => {
      // Check if it's our userdata endpoint
      if (url === '/api/userdata' && options?.method === 'GET') {
        try {
          // Extract token from headers
          const authHeader = options.headers?.Authorization;
          const token = authHeader?.replace('Bearer ', '');
          
          if (!token) {
            return new Response(
              JSON.stringify({ error: 'Unauthorized' }),
              { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          }
          
          // Create a mock user object from the token
          const mockUser = {
            id: 'mock-user-id',
            email: 'user@example.com',
            access_token: token,
            user_metadata: {
              name: 'John Doe',
              full_name: 'John Doe'
            },
            created_at: '2024-01-01T00:00:00Z',
            last_sign_in_at: '2024-01-15T10:30:00Z'
          };
          
          // Get mock data
          const mockData = await mockApiResponse(mockUser);
          
          return new Response(
            JSON.stringify(mockData),
            { 
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      }
      
      // For all other requests, use the original fetch
      return originalFetch(url, options);
    };
    
    console.log('🔧 Mock API setup complete for development');
  }
}

// Auto-setup in development
if (import.meta.env.DEV) {
  setupMockApi();
}






