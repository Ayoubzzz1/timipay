# Supabase Authentication Session Persistence Guide

This guide explains how Supabase authentication sessions are configured to persist across browser restarts, page reloads, and server restarts.

## Overview

The application is configured to automatically save and restore Supabase authentication sessions using **localStorage**. This ensures that users remain logged in even after:
- Closing and reopening the browser
- Restarting the localhost development server
- Refreshing the page
- Navigating between pages

## How It Works

### 1. Supabase Client Configuration

The Supabase client is configured in `src/lib/supabaseClient.js` with persistent session storage:

```javascript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,           // Uses browser localStorage
    autoRefreshToken: true,                  // Automatically refreshes tokens
    persistSession: true,                   // Persists session across reloads
    detectSessionInUrl: true,               // Handles OAuth callbacks
    flowType: 'pkce',                       // Secure PKCE flow
  },
})
```

**Key Features:**
- **localStorage**: Sessions are stored in the browser's localStorage, which persists across browser sessions
- **autoRefreshToken**: Automatically refreshes access tokens before they expire (every 50 minutes)
- **persistSession**: Ensures sessions are saved and restored automatically
- **PKCE Flow**: Uses the more secure Proof Key for Code Exchange (PKCE) authentication flow

### 2. Session Restoration on App Load

The `UserContext` (`src/contexts/UserContext.jsx`) automatically restores sessions when the app loads:

```javascript
useEffect(() => {
  const initializeSession = async () => {
    // Restore session from localStorage
    const session = await sessionStorage.restore();
    
    if (session?.user) {
      setUser(session.user);
      console.log('Session restored successfully');
    }
  };
  
  initializeSession();
  
  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    // Update user state when auth changes
  });
}, []);
```

**What happens on app load:**
1. Checks localStorage for an existing session
2. If found, restores the session
3. If the session is expired (less than 5 minutes remaining), automatically refreshes it
4. Updates the user context with the restored user

### 3. Automatic Token Refresh

Sessions automatically refresh in two ways:

**A. Supabase Built-in Refresh:**
- Supabase automatically refreshes tokens when they're close to expiring
- Happens in the background without user intervention

**B. Proactive Refresh Check:**
- The app also checks every 50 minutes and refreshes if needed
- Ensures tokens never expire unexpectedly

```javascript
// Check every 50 minutes
setInterval(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const expiresAt = session.expires_at;
    // Refresh if expiring in less than 10 minutes
    if (expiresAt && (expiresAt - now) < 600) {
      await supabase.auth.refreshSession();
    }
  }
}, 50 * 60 * 1000);
```

### 4. Session Storage Utilities

Session utility functions are available in `src/lib/supabaseClient.js`:

```javascript
import { sessionStorage } from '../lib/supabaseClient';

// Check if a session exists
const hasSession = await sessionStorage.hasSession();

// Manually restore session (usually automatic)
const session = await sessionStorage.restore();

// Clear all session data (used on sign out)
await sessionStorage.clear();
```

## Usage Examples

### Checking if User is Logged In

```javascript
import { useUser } from '../contexts/UserContext';

function MyComponent() {
  const { user, isLoading } = useUser();
  
  if (isLoading) return <div>Loading...</div>;
  
  if (user) {
    return <div>Welcome, {user.email}!</div>;
  } else {
    return <div>Please log in</div>;
  }
}
```

### Signing Out and Clearing Session

```javascript
import { sessionStorage } from '../lib/supabaseClient';

const handleSignOut = async () => {
  try {
    // This clears:
    // - Supabase session from localStorage
    // - Custom cookies (tp_user, sb-auth-token)
    // - All localStorage items related to Supabase
    await sessionStorage.clear();
    
    // Redirect to home page
    window.location.href = '/';
  } catch (error) {
    console.error('Sign out error:', error);
  }
};
```

All sign-out functions in the app (MuiNavbar, Usernavbar, Guestnavbar) use `sessionStorage.clear()` to ensure complete cleanup.

### Manual Session Check on App Load

```javascript
import { supabase, sessionStorage } from '../lib/supabaseClient';

// On app initialization
const initializeApp = async () => {
  const hasSession = await sessionStorage.hasSession();
  
  if (hasSession) {
    console.log('User is logged in');
    const session = await sessionStorage.restore();
    console.log('Session restored:', session?.user?.email);
  } else {
    console.log('No active session');
  }
};
```

## Security Considerations

### localStorage Security
- **Not HttpOnly**: localStorage is accessible to JavaScript, which means it's vulnerable to XSS attacks
- **Domain-Specific**: localStorage is domain-specific, so sessions won't leak to other domains
- **HTTPS Recommended**: Always use HTTPS in production to protect session data in transit

### Cookie Security (for custom cookies)
Custom cookies (like `tp_user`) use:
- `SameSite=Lax`: Prevents CSRF attacks
- `path=/`: Available across the entire site
- `max-age=0`: Cleared immediately when signing out

### Token Refresh
- Access tokens expire after 1 hour
- Refresh tokens are long-lived but can be revoked
- Tokens are automatically refreshed before expiration

## Testing Session Persistence

### Test 1: Browser Restart
1. Log in to the application
2. Close the browser completely
3. Reopen the browser and navigate to the app
4. **Expected**: You should still be logged in

### Test 2: Server Restart
1. Log in to the application
2. Stop your development server (if running locally)
3. Restart the server
4. Refresh the page
5. **Expected**: You should still be logged in

### Test 3: Page Reload
1. Log in to the application
2. Navigate to any page
3. Refresh the page (F5 or Ctrl+R)
4. **Expected**: You should still be logged in

### Test 4: Sign Out
1. Log in to the application
2. Sign out
3. Close and reopen the browser
4. Navigate to the app
5. **Expected**: You should NOT be logged in

## Troubleshooting

### Session Not Persisting

**Issue**: Sessions are not persisting after browser restart.

**Possible Causes:**
1. localStorage is disabled or blocked
2. Browser in incognito/private mode
3. Browser storage quota exceeded

**Solutions:**
1. Check browser settings to ensure localStorage is enabled
2. Use a regular browser window (not incognito)
3. Clear browser storage and try again
4. Check browser console for errors

### Token Expired Errors

**Issue**: Getting "token expired" errors even though session should be active.

**Possible Causes:**
1. Device clock is incorrect
2. Network issues preventing token refresh
3. Refresh token expired

**Solutions:**
1. Check device system time/date
2. Check network connectivity
3. Sign out and sign back in to get new tokens

### Multiple Sessions

**Issue**: Multiple tabs showing different user states.

**Possible Causes:**
1. Session state not syncing across tabs

**Solutions:**
1. Refresh all tabs after signing in/out
2. Use `onAuthStateChange` to sync state across tabs (already implemented)

## Environment Variables

Make sure these are set in your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SITE_URL=https://your-production-domain.com
```

**Note**: `VITE_SITE_URL` should be your production domain for email verification links and OAuth redirects.

## Production Considerations

### HTTPS Required
- localStorage works the same on HTTP and HTTPS
- However, HTTPS is required for:
  - OAuth providers (Google, etc.)
  - Secure token transmission
  - Production environments

### Domain Configuration
- Sessions are domain-specific
- If you have multiple subdomains, you may need to share sessions via cookies (not localStorage)
- Current implementation works for single domain deployments

### Browser Compatibility
- localStorage is supported in all modern browsers
- IE11 and below have limited support
- Current implementation works with:
  - Chrome/Edge (Chromium)
  - Firefox
  - Safari
  - Opera

## Files Modified

The following files were updated to implement persistent sessions:

1. **src/lib/supabaseClient.js**
   - Added persistent storage configuration
   - Added sessionStorage utility functions

2. **src/contexts/UserContext.jsx**
   - Enhanced session restoration logic
   - Added automatic token refresh
   - Improved error handling

3. **src/compoents/Navbars/MuiNavbar.jsx**
   - Updated sign-out to use sessionStorage.clear()

4. **src/compoents/Navbars/Usernavbar.jsx**
   - Updated sign-out to use sessionStorage.clear()

5. **src/compoents/Navbars/Guestnavbar.jsx**
   - Updated sign-out to use sessionStorage.clear()

## Summary

✅ Sessions persist across browser restarts  
✅ Sessions persist across page reloads  
✅ Sessions persist across server restarts  
✅ Tokens automatically refresh before expiration  
✅ Sign out properly clears all session data  
✅ Works in both development (localhost) and production (HTTPS)  
✅ Secure cookie handling with SameSite protection  

The authentication system is now fully persistent and will maintain user sessions until they explicitly sign out or the refresh token expires (typically after 30 days of inactivity).
