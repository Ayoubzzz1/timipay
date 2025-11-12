import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import Guestnavbar from '../../compoents/Navbars/Guestnavbar'
import Footer from '../../compoents/Footer/Footer'
import toast from 'react-hot-toast'

function Verified() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState(null)

  const goToStep3 = () => {
    navigate('/signup?step=3', { replace: true })
  }

  useEffect(() => {
    const handleVerification = async () => {
      try {
        setChecking(true)
        setError(null)

        // Handle hash tokens (#access_token ...) when coming back from email confirm
        const hash = window.location.hash
        if (hash && hash.length > 1) {
          const hashParams = new URLSearchParams(hash.substring(1))
          const access_token = hashParams.get('access_token')
          const refresh_token = hashParams.get('refresh_token')
          const type = hashParams.get('type')
          
          if (access_token && refresh_token && type === 'signup') {
            // Exchange the token for a session
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token
            })
            
            if (sessionError) {
              console.error('Error setting session:', sessionError)
              setError('Failed to verify email. Please try the link again.')
              setChecking(false)
              return
            }
            
            // Clean URL after processing hash
            window.history.replaceState({}, '', window.location.pathname)
            
            // Check if email is confirmed
            if (data?.user?.email_confirmed_at) {
              // Create or update user profile in data_user
              try {
                await supabase.from('data_user').upsert({
                  id: data.user.id,
                  email: data.user.email,
                  name: data.user.user_metadata?.name,
                  prename: data.user.user_metadata?.prename,
                  gender: data.user.user_metadata?.gender,
                  role: 'user',
                  phone: data.user.user_metadata?.phone || '',
                  interests: [],
                  terms: false
                }, { onConflict: 'id' })
              } catch (err) {
                console.error('Profile creation error:', err)
              }
              
              setVerified(true)
              toast.success('Email verified successfully!')
            } else {
              setError('Email verification not complete. Please try the link again.')
            }
          } else {
            setError('Invalid verification link. Please check your email and try again.')
          }
        } else {
          // No hash token, check if user is already verified
          const { data: userData } = await supabase.auth.getUser()
          if (userData?.user?.email_confirmed_at) {
            setVerified(true)
          } else {
            setError('No verification token found. Please check your email and click the verification link.')
          }
        }
      } catch (err) {
        console.error('Exception in verification:', err)
        setError('An error occurred during verification. Please try again.')
      } finally {
        setChecking(false)
      }
    }

    handleVerification()
  }, [])

  return (
    <>
      <Guestnavbar />
      <section className="bg-light min-vh-100 py-5 mt-20" style={{ backgroundImage: 'linear-gradient(180deg, rgba(102,126,234,0.06), rgba(118,75,162,0.06))' }}>
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-xl-5">
              <div className="card border-0 shadow" style={{ borderRadius: 16 }}>
                <div className="card-body p-5 text-center">
                  {checking ? (
                    <>
                      <div className="mb-4">
                        <div className="spinner-border text-warning" role="status" style={{ width: '4rem', height: '4rem' }}>
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                      <h3 className="text-dark mb-2">Verifying your email...</h3>
                      <p className="text-muted mb-0">Please wait while we confirm your email address.</p>
                    </>
                  ) : error ? (
                    <>
                      <div className="mb-4">
                        <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: '4rem' }}></i>
                      </div>
                      <h3 className="text-dark mb-2">Verification Failed</h3>
                      <p className="text-muted mb-4">{error}</p>
                      <button 
                        className="btn btn-warning text-white px-4" 
                        onClick={() => navigate('/signup', { replace: true })}
                      >
                        Go to Signup
                      </button>
                    </>
                  ) : verified ? (
                    <>
                      <div className="mb-4">
                        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                      </div>
                      <h3 className="text-dark mb-3">Thank you for verifying your account!</h3>
                      <p className="text-muted mb-4">
                        Your email has been successfully verified. You can now continue with the registration process.
                      </p>
                      <button 
                        className="btn btn-warning text-white px-5 py-2 fw-medium fs-5 hover-lift" 
                        onClick={goToStep3}
                      >
                        Continue to Step 3 <i className="bi bi-arrow-right ms-2"></i>
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}

export default Verified
