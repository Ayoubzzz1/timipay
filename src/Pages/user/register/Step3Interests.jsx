import React from 'react'

function Step3Interests({ allInterests, interests, errors, toggleInterest, onBack, onContinue }) {
  return (
    <div className="step-content">
      <h4 className="mb-4 text-dark">
        <i className="bi bi-heart me-2 text-warning"></i>
        Choose your interests
      </h4>
      <p className="text-muted mb-4">Select topics you're interested in to personalize your experience.</p>
      
      <div className="row g-3">
        {allInterests.map((interest) => (
          <div className="col-6 col-md-4 col-lg-3" key={interest}>
            <div 
              className={`interest-card border rounded-3 p-3 text-center cursor-pointer ${interests.includes(interest) ? 'bg-warning text-white' : 'bg-light'}`}
              onClick={() => toggleInterest(interest)}
              style={{ transition: 'all 0.2s ease', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div>
                <div className="fw-medium">{interest}</div>
                {interests.includes(interest) && (
                  <i className="bi bi-check-lg mt-1"></i>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {errors.interests && (
        <div className="alert alert-danger mt-3" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {errors.interests}
        </div>
      )}
      
      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-outline-secondary px-4" onClick={onBack}>
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
        <button className="btn btn-warning text-white px-4" onClick={onContinue}>
          Continue <i className="bi bi-arrow-right ms-2"></i>
        </button>
      </div>
    </div>
  )
}

export default Step3Interests















