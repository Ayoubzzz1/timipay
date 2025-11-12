import React from 'react'
import 'react-phone-input-2/lib/style.css'
import PhoneInput from 'react-phone-input-2'

function Step1Personal({ form, errors, oauthGoogle, updateField, setShowTerms, setForm, onContinue }) {
  return (
    <div className="step-content">
      <h4 className="mb-4 text-dark d-flex align-items-center gap-2">
        <i className="bi bi-person-plus text-warning"></i>
        Personal Information
      </h4>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label fw-medium text-dark">First Name</label>
          <input 
            name="name" 
            value={form.name} 
            onChange={updateField} 
            className={`form-control form-control-lg ${errors.name ? 'is-invalid' : ''}`} 
            placeholder="Enter your first name"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label fw-medium text-dark">Last Name</label>
          <input 
            name="prename" 
            value={form.prename} 
            onChange={updateField} 
            className={`form-control form-control-lg ${errors.prename ? 'is-invalid' : ''}`} 
            placeholder="Enter your last name"
          />
          {errors.prename && <div className="invalid-feedback">{errors.prename}</div>}
        </div>

        {!oauthGoogle && (
          <div className="col-12">
            <label className="form-label fw-medium text-dark">Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={form.email} 
              onChange={updateField} 
              className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`} 
              placeholder="you@example.com" 
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
        )}

        {/* Phone number (stored only; no SMS verification) */}
        <div className="col-12">
          <label className="form-label fw-medium text-dark">Mobile Number</label>
          <div className={errors.phone ? 'is-invalid' : ''}>
            <PhoneInput
              country={'us'}
              value={form.phone}
              onChange={(value) => {
                setForm(prev => ({ ...prev, phone: value }))
              }}
              inputClass="form-control form-control-lg"
              inputStyle={{ width: '100%' }}
              placeholder="Enter your phone number"
            />
          </div>
          {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
          <div className="form-text">Your number helps secure your account. We won't verify by SMS.</div>
        </div>

        {!oauthGoogle && (
          <>
            <div className="col-md-6">
              <label className="form-label fw-medium text-dark">Password</label>
              <input 
                type="password" 
                name="password" 
                value={form.password} 
                onChange={updateField} 
                className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`} 
                placeholder="Create a strong password" 
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-medium text-dark">Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword" 
                value={form.confirmPassword} 
                onChange={updateField} 
                className={`form-control form-control-lg ${errors.confirmPassword ? 'is-invalid' : ''}`} 
                placeholder="Repeat your password" 
              />
              {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
            </div>
          </>
        )}

        <div className="col-12">
          <label className="form-label fw-medium text-dark">Gender</label>
          <div className="d-flex flex-wrap gap-3">
            {['male', 'female', 'other'].map((gender) => (
              <div key={gender} className="form-check">
                <input 
                  className={`form-check-input ${errors.gender ? 'is-invalid' : ''}`} 
                  type="radio" 
                  name="gender" 
                  id={`gender${gender}`} 
                  value={gender} 
                  checked={form.gender === gender} 
                  onChange={updateField} 
                />
                <label className="form-check-label text-capitalize" htmlFor={`gender${gender}`}>
                  {gender}
                </label>
              </div>
            ))}
          </div>
          {errors.gender && <div className="invalid-feedback d-block">{errors.gender}</div>}
        </div>

        <div className="col-12">
          <div className="form-check">
            <input 
              className={`form-check-input ${errors.terms ? 'is-invalid' : ''}`} 
              type="checkbox" 
              name="terms" 
              id="terms" 
              checked={form.terms === true} 
              onChange={() => {}} // Prevent direct changes, only via modal
              readOnly
            />
            <label className="form-check-label" htmlFor="terms">
              I agree to the <button type="button" className="btn btn-link p-0 align-baseline text-warning text-decoration-none" onClick={() => setShowTerms(true)}>Terms & Privacy Policy</button>
              {form.terms && <span className="text-success ms-2"><i className="bi bi-check-circle-fill"></i> Accepted</span>}
            </label>
            {errors.terms && <div className="invalid-feedback d-block">{errors.terms}</div>}
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end mt-4">
        <button className="btn btn-warning text-white px-4 py-2 fw-medium hover-lift" onClick={onContinue}>
          Continue <i className="bi bi-arrow-right ms-2"></i>
        </button>
      </div>
    </div>
  )
}

export default Step1Personal








