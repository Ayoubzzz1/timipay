import React from 'react'

function Step2EmailVerify({ email, isVerified, timerSeconds, isExpired, isResending, resendInfo, errorMessage, onBack, onResend, onCheckAndContinue, mmss }) {
  return (
    <div className="step-content text-center">
      <div className="mb-4">
        <i className="bi bi-envelope-check text-warning" style={{ fontSize: '4rem' }}></i>
      </div>
      <h4 className="mb-3 text-dark">Verify your email address</h4>
      <p className="text-muted mb-4">
        We've sent a verification link to <strong className="text-dark">{email}</strong>. 
        Please check your inbox and click the link to verify your email address.
      </p>

      <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-warning bg-opacity-10 text-dark mb-2">
        <i className="bi bi-clock"></i>
        <span className="fw-medium">Link expires in {mmss(timerSeconds)}</span>
      </div>
      <div className={`small mb-3 ${isVerified ? 'text-success' : 'text-muted'}`}>
        {isVerified ? (
          <>
            <i className="bi bi-check-circle-fill me-1"></i>
            Email verified
          </>
        ) : (
          <>
            <i className="bi bi-hourglass-split me-1"></i>
            Waiting for verification...
          </>
        )}
      </div>
      
      <div className="alert alert-warning d-flex align-items-center" role="alert">
        <i className="bi bi-info-circle me-2"></i>
        <div>Can't find the email? Check your spam folder or request a new verification link.</div>
      </div>

      {resendInfo && (
        <div className="alert alert-info py-2" role="alert">{resendInfo}</div>
      )}

      {errorMessage && (
        <div className="alert alert-danger mt-3" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {errorMessage}
        </div>
      )}

      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-outline-secondary px-4" onClick={onBack}>
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-secondary px-4"
            type="button"
            disabled={!isExpired || isResending}
            onClick={onResend}
          >
            {isResending ? 'Resending…' : 'Resend email'}
          </button>
          <button 
            className="btn btn-warning text-white px-4" 
            onClick={onCheckAndContinue}
          >
            I've verified my email <i className="bi bi-check-lg ms-2"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Step2EmailVerify








