# User Session Management

This document explains how to access user session credentials throughout the application, particularly in sidebar components and pages.

## Overview

The application now uses a centralized `UserContext` that provides user session data to all components. This ensures that user credentials and data are consistently available throughout the application.

## Key Components

### 1. UserContext (`src/contexts/UserContext.jsx`)
- Centralized user state management
- Handles Supabase authentication
- Fetches extended user data from API
- Provides loading and error states

### 2. useUserSession Hook (`src/hooks/useUserSession.js`)
- Custom hook for easy access to user session data
- Provides utility functions for role checking and balance validation
- Returns comprehensive session object

### 3. Enhanced MuiNavbar (`src/compoents/Navbars/MuiNavbar.jsx`)
- Now uses UserContext instead of props
- Passes user session data to all navigation items
- Provides search functionality with user context

## Usage Examples

### Basic Usage in Any Component

```jsx
import React from 'react';
import { useUser } from '../contexts/UserContext';

function MyComponent() {
  const { user, userData, isLoading, error } = useUser();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Not authenticated</div>;
  
  return (
    <div>
      <h1>Welcome, {userData?.name || user.user_metadata?.name}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {userData?.role}</p>
      <p>Balance: ${userData?.balance}</p>
    </div>
  );
}
```

### Advanced Usage with useUserSession Hook

```jsx
import React from 'react';
import { useUserSession } from '../hooks/useUserSession';

function MyComponent() {
  const { 
    session, 
    hasRole, 
    hasMinimumBalance 
  } = useUserSession();
  
  return (
    <div>
      <h1>Welcome, {session.name}</h1>
      
      {hasRole('Premium User') && (
        <div>Premium features available!</div>
      )}
      
      {hasMinimumBalance(50) && (
        <button>Withdraw Funds</button>
      )}
    </div>
  );
}
```

### Accessing User Data in Sidebar Items

The navigation items now automatically include user session data:

```jsx
// In MuiNavbar.jsx, each navigation item includes:
{
  segment: 'dashboard',
  title: 'Dashboard',
  icon: <DashboardIcon />,
  user: user,           // Supabase user object
  userData: userData,  // Extended user data
}
```

### Page Components

All page components can now access user data without props:

```jsx
import React from 'react';
import { useUser } from '../contexts/UserContext';
import MuiNavbar from '../compoents/Navbars/MuiNavbar';

function Dashboard() {
  const { user, userData } = useUser();
  
  return (
    <MuiNavbar>  {/* No need to pass user prop */}
      <div>
        <h1>Dashboard</h1>
        <p>Welcome, {userData?.name}</p>
        <p>Your balance: ${userData?.balance}</p>
      </div>
    </MuiNavbar>
  );
}
```

## Available User Data

### From Supabase User Object (`user`)
- `id`: User ID
- `email`: User email
- `email_confirmed_at`: Email verification timestamp
- `user_metadata`: Additional user data (name, avatar, etc.)
- `app_metadata`: App-specific data (provider, etc.)
- `created_at`: Account creation date
- `last_sign_in_at`: Last sign-in timestamp
- `access_token`: Current access token
- `refresh_token`: Refresh token

### From Extended User Data (`userData`)
- `name`: User's display name
- `email`: User's email
- `role`: User role (e.g., 'Premium User', 'Admin')
- `balance`: Account balance
- `id`: User ID
- `created_at`: Account creation date
- `last_sign_in`: Last sign-in date

### From Session Object (`session`)
- `isAuthenticated`: Boolean authentication status
- `userId`: User ID
- `email`: User email
- `emailVerified`: Email verification status
- `name`: User's display name
- `avatar`: Avatar URL
- `provider`: Authentication provider
- `role`: User role
- `balance`: Account balance
- `accessToken`: Current access token
- `refreshToken`: Refresh token
- `isLoading`: Loading state
- `error`: Error message

## Utility Functions

### hasRole(role)
Check if user has a specific role:
```jsx
const { hasRole } = useUserSession();
if (hasRole('Admin')) {
  // Show admin features
}
```

### hasMinimumBalance(amount)
Check if user has minimum balance:
```jsx
const { hasMinimumBalance } = useUserSession();
if (hasMinimumBalance(50)) {
  // Allow withdrawal
}
```

## Error Handling

The system includes comprehensive error handling:

```jsx
const { user, userData, isLoading, error } = useUser();

if (isLoading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage message={error} />;
}

if (!user) {
  return <LoginPrompt />;
}
```

## Best Practices

1. **Always check loading and error states** before accessing user data
2. **Use the useUserSession hook** for complex user data operations
3. **Don't pass user props** - use the context instead
4. **Handle authentication state** gracefully in all components
5. **Use utility functions** for role and balance checks

## Migration Notes

- Remove `user` prop from MuiNavbar component calls
- Import and use `useUser` or `useUserSession` in components that need user data
- Update any components that previously received user data via props
- Ensure UserProvider wraps your entire application in App.jsx




