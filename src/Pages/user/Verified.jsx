import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import Guestnavbar from '../../compoents/Navbars/Guestnavbar'

function Verified() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [checking, setChecking] = useState(true)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState(null)

  const goToSetup = () => {
    navigate('/signup?step=3', { replace: true })
  }

  useEffect(() => {
    const handleVerification = async () => {
      try {
        setChecking(true)
        setError(null)

        let hasProcessed = false

        // Handle hash tokens (#access_token ...) when coming back from email confirm
        const hash = window.location.hash
        if (hash && hash.length > 1) {
          const hashParams = new URLSearchParams(hash.substring(1))
          const access_token = hashParams.get('access_token')
          const refresh_token = hashParams.get('refresh_token')
          
          if (access_token && refresh_token) {
            console.log('Setting session from hash tokens')
            const { error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token
            })
            
            if (sessionError) {
              console.error('Error setting session from hash:', sessionError)
              // Don't show error if session already exists (user might have verified already)
              if (!sessionError.message?.includes('already') && !sessionError.message?.includes('expired')) {
                setError('Failed to set session. Please try again.')
                setChecking(false)
                return
              }
            }
            
            hasProcessed = true
            // Clean URL after processing hash
            window.history.replaceState({}, '', window.location.pathname)
          }
        }

        // Handle code flow (?code=...) - PKCE flow
        const code = searchParams.get('code')
        const type = searchParams.get('type')
        
        if (code && (type === 'signup' || type === 'recovery' || type === 'invite' || !type)) {
          console.log('Exchanging code for session:', { code, type })
          const { data: sessionData, error: codeError } = await supabase.auth.exchangeCodeForSession({ code })
          
          if (codeError) {
            console.error('Error exchanging code:', codeError)
            // If code is already used or expired, check if user is already verified
            if (codeError.message?.includes('already been used') || codeError.message?.includes('expired')) {
              console.log('Code already used or expired, checking if user is verified')
              // Continue to check verification status
            } else {
              setError('Failed to verify email. Please try the link again.')
              setChecking(false)
              return
            }
          } else {
            console.log('Code exchanged successfully, session:', sessionData)
            hasProcessed = true
          }
          
          // Clean URL after processing code
          window.history.replaceState({}, '', window.location.pathname)
        }

        // Refresh session to ensure we have latest user data
        try {
          await supabase.auth.refreshSession()
        } catch (refreshErr) {
          console.warn('Session refresh warning:', refreshErr)
          // Continue anyway
        }
        
        // Check if user is verified - wait a bit for session to update
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const { data: userData, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('Error getting user:', userError)
          setError('Failed to verify user. Please try again.')
          setChecking(false)
          return
        }

        const user = userData?.user
        console.log('User data:', { 
          id: user?.id, 
          email: user?.email,
          email_confirmed_at: user?.email_confirmed_at,
          confirmed_at: user?.confirmed_at
        })

        if (user && (user.email_confirmed_at || user.confirmed_at)) {
          console.log('Email confirmed! Setting confirmed state and navigating to step 3')
          setConfirmed(true)
          
          // Small delay to show success message, then navigate
          setTimeout(() => {
            navigate('/signup?step=3', { replace: true })
          }, 1500)
        } else if (!hasProcessed) {
          // Only show error if we didn't process anything and user is not verified
          console.log('Email not confirmed yet and no verification data found')
          setError('Email verification not complete. Please check your email and click the verification link again.')
        } else {
          // If we processed something but user is not verified, wait a bit more
          console.log('Processed verification but not confirmed yet, checking again...')
          setTimeout(async () => {
            const { data: retryData } = await supabase.auth.getUser()
            const retryUser = retryData?.user
            if (retryUser && (retryUser.email_confirmed_at || retryUser.confirmed_at)) {
              setConfirmed(true)
              setTimeout(() => {
                navigate('/signup?step=3', { replace: true })
              }, 1000)
            } else {
              setError('Email verification is being processed. Please wait a moment and refresh.')
            }
            setChecking(false)
          }, 1000)
          return // Don't set checking to false yet
        }
      } catch (err) {
        console.error('Exception in verification:', err)
        setError('An error occurred during verification. Please try again.')
      } finally {
        setChecking(false)
      }
    }

    handleVerification()
  }, [navigate, searchParams])

  return (
    <>
      <Guestnavbar />
      <section className="bg-light min-vh-100 d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-5 text-center">
                  <div className="mb-3">
                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h3 className="text-dark mb-2">Thanks for verifying your email!</h3>
                  <p className="text-muted mb-4">Your email has been confirmed. Continue to finish setting up your account.</p>
                  <div className="d-flex justify-content-center gap-2">
                    <button className="btn btn-warning text-white px-4" onClick={goToSetup}>Continue setup</button>
                    <button className="btn btn-outline-secondary px-4" onClick={() => navigate('/', { replace: true })}>Go to Home</button>
                  </div>
                  {checking && (
                    <div className="alert alert-info mt-4 mb-0" role="alert">
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Verifying your email...
                    </div>
                  )}
                  {error && !checking && (
                    <div className="alert alert-danger mt-4 mb-0" role="alert">
                      {error}
                    </div>
                  )}
                  {!confirmed && !checking && !error && (
                    <div className="alert alert-warning mt-4 mb-0" role="alert">
                      We could not confirm your email yet. Please try the link again.
                    </div>
                  )}
                  {confirmed && (
                    <div className="alert alert-success mt-4 mb-0" role="alert">
                      Email verified successfully! Redirecting to continue setup...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Verified








