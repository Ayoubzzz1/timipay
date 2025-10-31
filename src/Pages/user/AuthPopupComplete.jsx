import React, { useEffect } from 'react'

function AuthPopupComplete() {
  useEffect(() => {
    try {
      if (window.opener) {
        window.opener.postMessage({ type: 'supabase-oauth-complete' }, '*')
      }
    } catch (_) {}
    try { window.close() } catch (_) {}
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


