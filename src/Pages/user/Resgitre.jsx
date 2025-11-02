import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Guestnavbar from '../../compoents/Navbars/Guestnavbar'
import Footer from '../../compoents/Footer/Footer'
import { supabase } from '../../lib/supabaseClient'
import toast from 'react-hot-toast'
import Box from '@mui/material/Box'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Popterms from '../../compoents/Popterms'
import 'react-phone-input-2/lib/style.css'
import PhoneInput from 'react-phone-input-2'
import Step1Personal from './register/Step1Personal'
import Step2EmailVerify from './register/Step2EmailVerify'
import Step3Interests from './register/Step3Interests'

function Register() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    prename: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: '',
    terms: false
  })
  const [interests, setInterests] = useState([])
  const [errors, setErrors] = useState({})
  const [timerSeconds, setTimerSeconds] = useState(90)
  const [isExpired, setIsExpired] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendInfo, setResendInfo] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [hasAutoAdvanced, setHasAutoAdvanced] = useState(false)
  const [pollId, setPollId] = useState(null)
  const [oauthGoogle, setOauthGoogle] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [didUpsertAfterVerify, setDidUpsertAfterVerify] = useState(false)

  const allInterests = ['Sport', 'Food', 'Technology', 'Music', 'Movies', 'Travel', 'Reading', 'Gaming', 'Fitness', 'Art', 'Photography', 'Cooking']

  const steps = [
    { number: 1, title: 'Personal Info', icon: '👤' },
    { number: 2, title: 'Verify Email', icon: '✉️' },
    { number: 3, title: 'Interests', icon: '🎯' },
    { number: 4, title: 'Complete', icon: '🎉' }
  ]

  const updateField = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  const toggleInterest = (value) => {
    setInterests(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])
  }

  const validateStep1 = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.prename.trim()) newErrors.prename = 'Prename is required'
    if (!oauthGoogle) {
      if (!form.email.trim()) newErrors.email = 'Email is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Please enter a valid email address'
      if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
      if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords don't match"
    }
    if (form.phone && form.phone.replace(/\D/g, '').length < 7) newErrors.phone = 'Please enter a valid phone number'
    if (!form.gender) newErrors.gender = 'Please select your gender'
    if (!form.terms) newErrors.terms = 'You must accept the terms and conditions'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const goNext = async () => {
    if (currentStep === 1) {
      if (!validateStep1()) return
      if (oauthGoogle) {
        try {
          const { data } = await supabase.auth.getUser()
          const u = data?.user
          if (u) {
            try { await supabase.auth.updateUser({ data: { role: 'user', name: form.name, prename: form.prename, gender: form.gender, phone: form.phone || '' } }) } catch (_) {}
            await supabase.from('data_user').upsert({
              id: u.id,
              email: u.email,
              name: form.name,
              prename: form.prename,
              gender: form.gender,
              role: 'user',
              phone: form.phone || '',
              interests: [],
              terms: form.terms === true
            }, { onConflict: 'id' })
          }
        } catch (_) {}
        setCurrentStep(3)
        return
      }
      // Check if email already exists (either via prior signup or Google OAuth)
      try {
        const { data: existing } = await supabase
          .from('data_user')
          .select('id')
          .eq('email', form.email)
          .maybeSingle()
        if (existing) {
          setErrors({ email: 'This email is already registered' })
          toast.error('This email is already registered')
          return
        }
      } catch (_) {}

      const t = toast.loading('Creating your account...')
      const siteUrl = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '')
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${siteUrl}/verify`,
          data: {
            name: form.name,
            prename: form.prename,
            gender: form.gender,
            role: 'user',
            phone: form.phone || ''
          }
        }
      })
      if (error) {
        const friendly = /registered|exists|already/i.test(error.message)
          ? 'This email is already registered'
          : error.message
        setErrors({ email: friendly })
        toast.error(friendly, { id: t })
        return
      }
      try {
        // Create or update the profile row immediately after signup
        const { data: userData } = await supabase.auth.getUser()
        const authUser = userData?.user
        if (authUser) {
          const payload = {
            id: authUser.id,
            email: form.email,
            name: form.name,
            prename: form.prename,
            gender: form.gender,
            role: 'user',
            phone: form.phone || '',
            interests: [],
            terms: form.terms === true
          }
          const { error: upsertError } = await supabase
            .from('data_user')
            .upsert(payload, { onConflict: 'id' })
          if (upsertError) {
            // Non-blocking: show toast but continue flow
            toast.error(upsertError.message)
          }
        }
      } catch (_) {}
      toast.success('Signup successful! Check your email to verify.', { id: t })
    }
    if (currentStep === 2) {
      // Email verification only
      try {
        const { data } = await supabase.auth.getUser()
        const user = data?.user
        if (!user || !user.email_confirmed_at) {
          setErrors({ verify: 'Your email is not verified yet. Please click the link in your inbox, then try again.' })
          return
        }
        await upsertAfterVerifyOnce()
      } catch (_) {
        setErrors({ verify: 'Unable to check verification status. Please try again.' })
        return
      }
    }
    if (currentStep === 3 && interests.length === 0) {
      setErrors({ interests: 'Please select at least one interest' })
      return
    }
    if (currentStep === 3) {
      // Persist interests as soon as the user completes the interests step
      try {
        const { data } = await supabase.auth.getUser()
        const user = data?.user
        if (user) {
          await supabase
            .from('data_user')
            .update({ interests, terms: form.terms === true })
            .eq('id', user.id)
        }
      } catch (_) {}
    }
    setErrors({})
    setCurrentStep(prev => Math.min(prev + 1, 4))
  }

  const upsertAfterVerifyOnce = async () => {
    if (didUpsertAfterVerify) return
    try {
      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user) return
      const payload = {
        id: user.id,
        email: user.email,
        name: form.name,
        prename: form.prename,
        gender: form.gender,
        role: 'user',
        phone: form.phone || '',
        terms: form.terms === true
      }
      await supabase.from('data_user').upsert(payload, { onConflict: 'id' })
      setDidUpsertAfterVerify(true)
    } catch (_) {}
  }

  const goBack = () => {
    setErrors({})
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const finish = async () => {
    try {
      const t = toast.loading('Finalizing your profile...')
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        await supabase.auth.updateUser({ data: { interests } })
        const userId = data.user.id
        const payload = {
          id: userId,
          name: form.name,
          prename: form.prename,
          email: form.email,
          gender: form.gender,
          role: 'user',
          phone: form.phone || '',
          interests: interests,
          terms: form.terms === true,
        }
        const { error: upsertError } = await supabase
          .from('data_user')
          .upsert(payload, { onConflict: 'id' })
        if (upsertError) {
          toast.error(upsertError.message, { id: t })
        } else {
          toast.success('Profile saved. Redirecting...', { id: t })
        }
      }
    } catch (e) {
      // ignore for now
      toast.error('Could not finalize profile')
    }
    navigate('/dashboard')
  }

  // Check for Google OAuth flow on component mount
  useEffect(() => {
    const checkGoogleOAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const oauthParam = params.get('oauth');
        
        if (oauthParam === 'google') {
          // Check if user is authenticated via Google
          const { data } = await supabase.auth.getUser();
          const user = data?.user;
          
          if (user) {
            setOauthGoogle(true);
            
            // Pre-fill form with Google user data
            setForm(prev => ({
              ...prev,
              name: user.user_metadata?.name?.split(' ')[0] || '',
              prename: user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
              email: user.email || '',
            }));
            
            // Clean URL parameters
            window.history.replaceState({}, '', window.location.pathname);
          }
        }
      } catch (error) {
        console.error('Error checking Google OAuth:', error);
      }
    };
    
    checkGoogleOAuth();
  }, []);

  // Respect explicit step in URL on first load (e.g., /signup?step=3)
  // This is used when user comes from /verify page after email confirmation
  useEffect(() => {
    const checkStepAndVerification = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const reqStep = parseInt(params.get('step') || '0', 10)
        
        if (reqStep === 3) {
          console.log('Step 3 requested, checking verification status')
          // User was redirected from /verify page with step=3
          // Check if email is actually verified
          try {
            const { data } = await supabase.auth.getUser()
            const u = data?.user
            console.log('User verification check:', {
              hasUser: !!u,
              email_confirmed_at: u?.email_confirmed_at,
              confirmed_at: u?.confirmed_at
            })
            
            if (u && (u.email_confirmed_at || u.confirmed_at)) {
              // Email is verified, proceed to step 3
              console.log('Email verified! Proceeding to step 3')
              setIsVerified(true)
              await upsertAfterVerifyOnce()
              setCurrentStep(3)
              // Clean URL
              window.history.replaceState({}, '', window.location.pathname)
            } else {
              // Email not verified yet, stay on step 2
              console.log('Email not verified yet, staying on step 2')
              setCurrentStep(2)
              setErrors(prev => ({ ...prev, verify: 'Email verification required. Please check your email and click the verification link.' }))
            }
          } catch (err) {
            console.error('Error checking verification:', err)
            // If error, still try to go to step 3 if requested (user might be verified)
            setCurrentStep(3)
          }
        }
      } catch (err) {
        console.error('Error checking step:', err)
      }
    }
    
    checkStepAndVerification()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle countdown timer on Step 2 (email verification)
  useEffect(() => {
    if (currentStep !== 2) return
    // If user arrived with ?step=3, only honor it when already confirmed
    try {
      const params = new URLSearchParams(window.location.search)
      const reqStep = params.get('step')
      if (reqStep === '3') {
        // We'll only jump to step 3 after a real confirmation check (listener/poller/button)
        window.history.replaceState({}, '', window.location.pathname)
      }
    } catch (_) {}
    setIsExpired(false)
    setResendInfo('')
    setTimerSeconds(90)
    setIsVerified(false)
    const id = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(id)
          setIsExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [currentStep])

  // Listen for auth changes (e.g., after clicking email link, session is set)
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user
      if (u?.email_confirmed_at || u?.confirmed_at) {
        setIsVerified(true)
        setErrors(prev => ({ ...prev, verify: undefined }))
        if (currentStep === 2 && !hasAutoAdvanced) {
          setHasAutoAdvanced(true)
          // Clean query params and stay on the same page
          try { window.history.replaceState({}, '', window.location.pathname) } catch (_) {}
          await upsertAfterVerifyOnce()
          setCurrentStep(3)
        }
      }
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  // Note: do not auto-advance on mount. We only advance from Step 2 after verification is confirmed.

  // While on Step 2, poll Supabase for verification and auto-advance when confirmed
  useEffect(() => {
    if (currentStep !== 2) {
      if (pollId) {
        clearInterval(pollId)
        setPollId(null)
      }
      return
    }
    const id = setInterval(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        const u = data?.user
        if (u?.email_confirmed_at || u?.confirmed_at) {
          setIsVerified(true)
          setErrors(prev => ({ ...prev, verify: undefined }))
          if (!hasAutoAdvanced) {
            setHasAutoAdvanced(true)
            // Clean query params and stay on the same page
            try { window.history.replaceState({}, '', window.location.pathname) } catch (_) {}
            await upsertAfterVerifyOnce()
            setCurrentStep(3)
            toast.success('Email verified')
          }
        }
      } catch (_) {
        // ignore
      }
    }, 3000)
    setPollId(id)
    return () => clearInterval(id)
  }, [currentStep, hasAutoAdvanced])

  const mmss = (total) => {
    const m = Math.floor(total / 60).toString().padStart(1, '0')
    const s = (total % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const resendVerification = async () => {
    try {
      setIsResending(true)
      setResendInfo('')
      const t = toast.loading('Sending verification email...')
      const siteUrl = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '')
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: form.email,
        options: { emailRedirectTo: `${siteUrl}/verify` }
      })
      if (error) {
        setResendInfo(error.message)
        toast.error(error.message, { id: t })
        setIsResending(false)
        return
      }
      // reset timer and enable verify again
      setTimerSeconds(90)
      setIsExpired(false)
      setResendInfo('Verification email sent again. Please check your inbox.')
      toast.success('Verification email sent', { id: t })
    } catch (e) {
      setResendInfo(e.message)
      toast.error(e.message)
    } finally {
      setIsResending(false)
    }
  }

  const checkAndAdvanceAfterVerification = async () => {
    try { await supabase.auth.refreshSession() } catch (_) {}
    try {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      if (code) {
        try { await supabase.auth.exchangeCodeForSession({ code }) } catch (_) {}
        try { window.history.replaceState({}, '', window.location.pathname) } catch (_) {}
      }
    } catch (_) {}
    const { data } = await supabase.auth.getUser()
    const u = data?.user
    if (u?.email_confirmed_at || u?.confirmed_at) {
      setIsVerified(true)
      await upsertAfterVerifyOnce()
      setCurrentStep(3)
      return
    }
    toast.error('Not verified yet. Please click the link in your email.')
  }

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100

  return (
    <>
      <Guestnavbar />

      <section className="bg-light min-vh-100 py-5 mt-5" style={{ backgroundImage: 'linear-gradient(180deg, rgba(102,126,234,0.06), rgba(118,75,162,0.06))' }}>
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-7">
              
              {/* Progress Stepper */}
              <div className="card border-0 shadow mb-4" style={{ borderRadius: 16 }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h4 mb-0 text-dark d-flex align-items-center gap-2">
                      <i className="bi bi-rocket-takeoff-fill text-warning"></i>
                      Create your account
                    </h2>
                    <span className="badge bg-warning text-dark fs-6">
                      Step {currentStep} of {steps.length}
                    </span>
                  </div>
                  <Box sx={{ width: '100%' }}>
                    <Stepper activeStep={currentStep - 1} alternativeLabel>
                      {steps.map((s) => (
                        <Step key={s.title}>
                          <StepLabel>{s.title}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </Box>
                </div>
              </div>

              {/* Form Card */}
              <div className="card border-0 shadow" style={{ borderRadius: 16 }}>
                <div className="card-body p-4 p-md-5">
                  
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <Step1Personal 
                      form={form}
                      errors={errors}
                      oauthGoogle={oauthGoogle}
                      updateField={updateField}
                      setShowTerms={setShowTerms}
                      setForm={setForm}
                      onContinue={goNext}
                    />
                  )}

                  {/* Step 2: Email Verification */}
                  {currentStep === 2 && (
                    <Step2EmailVerify
                      email={form.email}
                      isVerified={isVerified}
                      timerSeconds={timerSeconds}
                      isExpired={isExpired}
                      isResending={isResending}
                      resendInfo={resendInfo}
                      errorMessage={errors.verify}
                      onBack={goBack}
                      onResend={resendVerification}
                      onCheckAndContinue={checkAndAdvanceAfterVerification}
                      mmss={mmss}
                    />
                  )}

                  {/* Step 3: Interests */}
                  {currentStep === 3 && (
                    <Step3Interests
                      allInterests={allInterests}
                      interests={interests}
                      errors={errors}
                      toggleInterest={toggleInterest}
                      onBack={goBack}
                      onContinue={goNext}
                    />
                  )}

                  {/* Step 4: Completion */}
                  {currentStep === 4 && (
                    <div className="step-content text-center py-4">
                      <div className="mb-4">
                        <i className="bi bi-trophy-fill text-warning" style={{ fontSize: '4rem' }}></i>
                      </div>
                      <h3 className="fw-bold mb-3 text-dark d-flex align-items-center justify-content-center gap-2">Welcome to Timipay! <span role="img" aria-label="party">🎉</span></h3>
                      <p className="text-muted mb-4 fs-5">
                        Hello champion! Your account is ready. Let's start earning money together.
                      </p>
                      
                      <div className="row justify-content-center mb-4">
                        <div className="col-md-8">
                          <div className="card border-0 bg-warning bg-opacity-10">
                            <div className="card-body py-3">
                              <h6 className="mb-2 text-dark">
                                <i className="bi bi-check-circle-fill text-success me-2"></i>
                                Account Summary
                              </h6>
                              <div className="text-start small">
                                <div className="mb-1"><strong>Name:</strong> {form.name} {form.prename}</div>
                                <div className="mb-1"><strong>Email:</strong> {form.email}</div>
                                <div><strong>Interests:</strong> {interests.join(', ') || 'None selected'}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button className="btn btn-dark px-5 py-2 fw-medium fs-5 hover-lift" onClick={finish}>
                        Go to Dashboard <i className="bi bi-arrow-right ms-2"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
      <Popterms 
        open={showTerms} 
        onClose={() => setShowTerms(false)} 
        onAccept={() => { setForm(prev => ({ ...prev, terms: true })); setShowTerms(false); }}
      />
    </>
  )
}

export default Register