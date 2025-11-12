import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create Supabase client with persistent storage configuration
// By default, Supabase uses localStorage for session persistence
// This ensures sessions survive browser restarts and page reloads
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use localStorage for persistent session storage
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // Automatically refresh tokens before they expire (refresh every 50 minutes)
    autoRefreshToken: true,
    // Persist session across page reloads
    persistSession: true,
    // Detect session from URL hash (for OAuth callbacks)
    detectSessionInUrl: true,
    // Flow type - 'pkce' is more secure and recommended
    flowType: 'pkce',
    // Storage key prefix (default is 'sb-{project-ref}-auth-token')
    // You can customize this if needed
  },
})

// Session persistence utility functions
export const sessionStorage = {
  // Save session to localStorage (handled automatically by Supabase)
  // This is a utility to manually trigger a session save if needed
  save: () => {
    if (typeof window !== 'undefined') {
      // Supabase automatically saves to localStorage, but we can verify
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          // Session is automatically persisted by Supabase
          console.debug('Session persisted to localStorage');
        }
      });
    }
  },

  // Clear all session data from localStorage
  clear: async () => {
    if (typeof window !== 'undefined') {
      // Clear Supabase session
      await supabase.auth.signOut();
      // Clear any custom session cookies with secure flags
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      const secureFlag = isSecure ? '; Secure' : '';
      document.cookie = `sb-auth-token=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
      document.cookie = `tp_user=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
      // Clear localStorage items related to Supabase (with our project ref)
      const supabaseKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('sb-') || key.startsWith('supabase.auth.')
      );
      supabaseKeys.forEach(key => localStorage.removeItem(key));
    }
  },

  // Check if a session exists
  hasSession: async () => {
    if (typeof window === 'undefined') return false;
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  // Restore session on app load (called automatically by Supabase, but useful for manual checks)
  restore: async () => {
    if (typeof window === 'undefined') return null;
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error restoring session:', error);
        return null;
      }
      
      // If session exists but is expired, try to refresh it
      if (session) {
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = session.expires_at;
        
        // If session expires in less than 5 minutes, refresh it
        if (expiresAt && (expiresAt - now) < 300) {
          try {
            const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error('Error refreshing session:', refreshError);
              return session; // Return existing session even if refresh failed
            }
            return newSession;
          } catch (refreshErr) {
            console.error('Exception refreshing session:', refreshErr);
            return session;
          }
        }
      }
      
      return session;
    } catch (err) {
      console.error('Exception restoring session:', err);
      return null;
    }
  },
}


