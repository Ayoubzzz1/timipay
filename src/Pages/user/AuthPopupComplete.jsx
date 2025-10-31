import React, { useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

function AuthPopupComplete() {
  useEffect(() => {
    const complete = async () => {
      try {
        // Handle hash fragment tokens (#access_token=...&refresh_token=...)
        if (window.location.hash && window.location.hash.length > 1) {
          const params = new URLSearchParams(window.location.hash.substring(1))
          const access_token = params.get('access_token')
          const refresh_token = params.get('refresh_token')
          const expires_in = parseInt(params.get('expires_in') || '3600', 10)
          if (access_token && refresh_token) {
            try {
              await supabase.auth.setSession({ access_token, refresh_token })
            } catch (_) {}
          }
        }
        // Handle code flow (?code=...)
        try {
          const search = new URLSearchParams(window.location.search)
          const code = search.get('code')
          if (code) {
            try { await supabase.auth.exchangeCodeForSession({ code }) } catch (_) {}
          }
        } catch (_) {}
      } catch (_) {}
      // Notify opener and close
      try {
        if (window.opener) {
          window.opener.postMessage({ type: 'supabase-oauth-complete' }, '*')
        }
      } catch (_) {}
      try {
        // Prevent SPA from rendering in popup
        document.body.innerHTML = ''
        window.location.replace('about:blank')
      } catch (_) {}
      try { window.close() } catch (_) {}
    }
    complete()
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <div>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>Completing sign-in…</div>
        <div style={{ textAlign: 'center', color: '#666' }}>You can close this window.</div>
      </div>
    </div>
  )
}

export default AuthPopupComplete


