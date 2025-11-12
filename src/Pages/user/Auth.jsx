import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight, AlertCircle, Shield } from 'lucide-react'
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
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Email and password are required')
      return
    }
    setIsLoading(true)
    const t = toast.loading('Signing you in...')
    
    try {
      // Proceed with authentication
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      
      if (authError) {
        setIsLoading(false)
        setError(authError.message)
        toast.error(authError.message, { id: t })
        return
      }
      
      // Check if email is confirmed
      if (authData?.user && !authData.user.email_confirmed_at) {
        // Sign out immediately if email not confirmed
        await supabase.auth.signOut()
        setIsLoading(false)
        setError('Please verify your email address before logging in. Check your inbox for the verification link.')
        toast.error('Email not verified. Please check your inbox.', { id: t })
        return
      }
      
      setIsLoading(false)
      toast.success('Signed in successfully', { id: t })
      navigate('/dashboard')
    } catch (err) {
      setIsLoading(false)
      setError(err.message)
      toast.error(err.message, { id: t })
    }
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

        const onMessage = async (e) => {
          if (!e?.data || e.data.type !== 'supabase-oauth-complete') return
          window.removeEventListener('message', onMessage)
          try { popup && popup.close() } catch (_) {}
          const { data: userData } = await supabase.auth.getUser()
          if (userData?.user) {
            toast.success('Signed in successfully', { id: t })
            navigate('/signup?oauth=google')
          } else {
            toast.dismiss(t)
          }
        }
        window.addEventListener('message', onMessage)
        setTimeout(() => { toast.dismiss(t); window.removeEventListener('message', onMessage) }, 20000)
      } else {
        toast.dismiss(t)
      }
    } catch (e) {
      toast.error(e.message || 'Could not open Google sign-in', { id: t })
    }
  }

  React.useEffect(() => {
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
  }, [navigate])

  return (
    <>
      <Guestnavbar />
    
      <section className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-16 px-4 ">
        <div className="max-w-md mx-auto mt-20">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform transition-all hover:shadow-2xl ">
            {/* Header */}
            

            <div className="p-8">
              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={onSubmit} className="space-y-5">
                {/* Email Input */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white transition-all text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white transition-all text-gray-900 placeholder-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold py-4 rounded-xl hover:from-amber-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-200"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">or continue with</span>
                  </div>
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="w-full bg-white border-2 border-gray-200 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-sm"
                >
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303C33.876,32.91,29.32,36,24,36c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.568,16.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.65,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.246,0,10.03-2.007,13.605-5.292l-6.276-5.314C29.242,35.091,26.715,36,24,36c-5.304,0-9.852-3.071-11.289-7.449l-6.522,5.025C9.51,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-1.236,3.652-4.396,6.447-8.289,7.318l6.276,5.314C32.861,41.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                  Continue with Google
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-gray-600">Don't have an account?</p>
                  <Link
                    to="/signup"
                    className="text-sm font-semibold text-amber-600 hover:text-amber-700 hover:underline transition-colors"
                  >
                    Create one →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure authentication by Supabase</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default Auth