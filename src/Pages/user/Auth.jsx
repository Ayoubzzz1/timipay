import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Guestnavbar from '../../compoents/Navbars/Guestnavbar'
import Footer from '../../compoents/Footer/Footer'
import { supabase } from '../../lib/supabaseClient'
import toast from 'react-hot-toast'

function Auth() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Email and password are required')
      return
    }
    const t = toast.loading('Signing you in...')
    supabase.auth.signInWithPassword({ email, password })
      .then(({ error }) => {
        if (error) {
          setError(error.message)
          toast.error(error.message, { id: t })
          return
        }
        toast.success('Signed in successfully', { id: t })
        navigate('/dashboard')
      })
      .catch((err) => {
        setError(err.message)
        toast.error(err.message, { id: t })
      })
  }

  const signInWithGoogle = async () => {
    const t = toast.loading('Opening Google sign-in...')
    try {
      const siteUrl = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${siteUrl}/auth/popup-complete`,
          skipBrowserRedirect: true,
        }
      })
      if (error) {
        toast.error(error.message, { id: t })
        return
      }
      if (data?.url) {
        const width = 500
        const height = 650
        const left = Math.max(0, Math.floor(window.screenX + (window.outerWidth - width) / 2))
        const top = Math.max(0, Math.floor(window.screenY + (window.outerHeight - height) / 2))
        const popup = window.open(
          data.url,
          'googleOAuthPopup',
          `toolbar=no, location=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=${width}, height=${height}, top=${top}, left=${left}`
        )

        // Listen for completion message from popup
        const onMessage = async (e) => {
          if (!e?.data || e.data.type !== 'supabase-oauth-complete') return
          window.removeEventListener('message', onMessage)
          try { popup && popup.close() } catch (_) {}
          const { data: userData } = await supabase.auth.getUser()
          if (userData?.user) {
            toast.success('Signed in successfully', { id: t })
            // Start the registration at Step 1, but with oauth=google so email/password & verification are skipped
            navigate('/signup?oauth=google')
          } else {
            toast.dismiss(t)
          }
        }
        window.addEventListener('message', onMessage)
        // Fallback: safety dismissal after 20s
        setTimeout(() => { toast.dismiss(t); window.removeEventListener('message', onMessage) }, 20000)
      } else {
        toast.dismiss(t)
      }
    } catch (e) {
      toast.error(e.message || 'Could not open Google sign-in', { id: t })
    }
  }

  return (
    <>
      <Guestnavbar />
    
      <section className="bg-light py-5 mt-5">
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
              <div className="card border-0 shadow" style={{ borderRadius: 16 }}>
                <div className="card-body p-3 p-md-4 p-lg-5">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className="bi bi-lightning-charge-fill text-warning"></i>
                    <h2 className="h4 mb-0">Sign in to Timipay</h2>
                  </div>
                  <p className="text-muted mb-4">Earn while you work with Picture‑in‑Picture.</p>
                  {/* Handle oauth=google redirect: if session exists, go to dashboard; else send to signup interests */}
                  {(() => {
                    const search = new URLSearchParams(window.location.search)
                    const oauth = search.get('oauth')
                    if (oauth === 'google') {
                      supabase.auth.getUser().then(async ({ data }) => {
                        const u = data?.user
                        if (!u) return
                        try {
                          const { data: exists } = await supabase
                            .from('data_user')
                            .select('id')
                            .eq('id', u.id)
                            .maybeSingle()
                          if (exists) {
                            navigate('/dashboard')
                          } else {
                            navigate('/signup?oauth=google')
                          }
                        } catch (_) {
                          navigate('/dashboard')
                        }
                      })
                    }
                    return null
                  })()}
                  {error && (
                    <div className="alert alert-danger py-2 d-flex align-items-center gap-2">
                      <i className="bi bi-exclamation-triangle-fill"></i>
                      <span>{error}</span>
                    </div>
                  )}
                  <form onSubmit={onSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-medium">Email</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-white border-end-0">
                          <i className="bi bi-person"></i>
                        </span>
                        <input 
                          type="email" 
                          className="form-control border-start-0" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium">Password</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-white border-end-0">
                          <i className="bi bi-lock"></i>
                        </span>
                        <input 
                          type={showPassword ? 'text' : 'password'} 
                          className="form-control border-start-0 border-end-0" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          placeholder="••••••"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary border-start-0"
                          onClick={() => setShowPassword(v => !v)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                    <div className="d-grid mt-4">
                      <button type="submit" className="btn btn-warning text-white py-3 fw-semibold hover-lift" style={{ borderRadius: 10 }}>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Sign In
                      </button>
                    </div>
                    <div className="text-center my-3 text-muted">or</div>
                    <div className="d-grid">
                      <button 
                        type="button" 
                        onClick={signInWithGoogle} 
                        className="btn btn-outline-dark d-flex align-items-center justify-content-center gap-2 py-3 hover-lift" 
                        style={{ borderRadius: 10 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303C33.876,32.91,29.32,36,24,36c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.568,16.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C34.046,6.053,29.268,4,24,4C16.318,4,9.65,8.337,6.306,14.691z"/>
                          <path fill="#4CAF50" d="M24,44c5.246,0,10.03-2.007,13.605-5.292l-6.276-5.314C29.242,35.091,26.715,36,24,36 c-5.304,0-9.852-3.071-11.289-7.449l-6.522,5.025C9.51,39.556,16.227,44,24,44z"/>
                          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-1.236,3.652-4.396,6.447-8.289,7.318c0.001,0,0.001,0.001,0.002,0.001 l6.276,5.314C32.861,41.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                        </svg>
                        Continue with Google
                      </button>
                    </div>
                  </form>
                  <div className="mt-4 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2">
                    <p className="mb-0 text-muted text-center text-sm-start">Don't have an account?</p>
                    <Link to="/signup" className="btn btn-outline-warning fw-semibold px-4">
                      Create one
                    </Link>
                  </div>
                </div>
              </div>
              <div className="text-center mt-3 text-muted small">
                <i className="bi bi-shield-check me-1 text-success"></i>
                Secure authentication by Supabase
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}

export default Auth