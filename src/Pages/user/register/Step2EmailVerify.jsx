import React, { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

function Step2EmailVerify({ email, isVerified, errorMessage, onBack, onResend, onContinue }) {
  const [verified, setVerified] = useState(isVerified)

  // Auto-check verification status periodically
  useEffect(() => {
    if (verified) return

    const checkInterval = setInterval(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (data?.user?.email_confirmed_at) {
          setVerified(true)
          // Email is verified, trigger continue
          if (onContinue) {
            setTimeout(() => onContinue(), 500)
          }
        }
      } catch (err) {
        console.error('Verification check error:', err)
      }
    }, 2000) // Check every 2 seconds

    return () => clearInterval(checkInterval)
  }, [verified, onContinue])

  if (verified) {
    return (
      <div className="step-content text-center">
        <div className="mb-4">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
        </div>
        <h4 className="mb-3 text-dark">Email Verified!</h4>
        <p className="text-muted mb-4">
          Your email address has been successfully verified. Redirecting to next step...
        </p>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="step-content text-center">
      <div className="mb-4">
        <i className="bi bi-envelope-check text-warning" style={{ fontSize: '4rem' }}></i>
      </div>
      <h4 className="mb-3 text-dark">Verify Your Email</h4>
      <p className="text-muted mb-4">
        We've sent a verification email to <strong className="text-dark">{email}</strong>. 
        Please click the link in the email to verify your account.
      </p>

      <div className="alert alert-info d-flex align-items-center justify-content-center gap-2 mb-4" role="alert">
        <i className="bi bi-info-circle"></i>
        <div>Once you click the link, you'll be automatically redirected to the next step.</div>
      </div>

      {errorMessage && (
        <div className="alert alert-danger mt-3" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {errorMessage}
        </div>
      )}

      <div className="alert alert-warning d-flex align-items-center mt-3" role="alert">
        <i className="bi bi-info-circle me-2"></i>
        <div>Can't find the email? Check your spam folder or request a new verification email.</div>
      </div>

      <div className="d-flex justify-content-between mt-4">
        <button 
          className="btn btn-outline-secondary px-4" 
          onClick={onBack}
        >
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
        <button 
          className="btn btn-secondary px-4"
          type="button"
          onClick={onResend}
        >
          Resend Email
        </button>
      </div>
    </div>
  )
}

export default Step2EmailVerify
