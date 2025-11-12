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
  const [oauthGoogle, setOauthGoogle] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

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

  // Step 1: Handle registration and go to step 2
  const handleStep1 = async () => {
    if (!validateStep1()) return
    
    // Handle Google OAuth flow
    if (oauthGoogle) {
      try {
        const { data } = await supabase.auth.getUser()
        const u = data?.user
        if (u) {
          await supabase.auth.updateUser({ 
            data: { 
              role: 'user', 
              name: form.name, 
              prename: form.prename, 
              gender: form.gender, 
              phone: form.phone || '' 
            } 
          })
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
      } catch (err) {
        console.error('OAuth update error:', err)
      }
      setCurrentStep(3)
      return
    }

    // Check if email already exists
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
    } catch (err) {
      console.error('Email check error:', err)
    }

    // Sign up with email verification link
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

    toast.success('Verification email sent! Check your inbox.', { id: t })
    
    // Go to step 2 and wait for email confirmation
    setCurrentStep(2)
    setErrors({})
  }

  // Step 2: Check email verification (manual check via button)
  const handleStep2 = async () => {
    try {
      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user || !user.email_confirmed_at) {
        setErrors({ verify: 'Please verify your email by clicking the link we sent you.' })
        toast.error('Email not verified yet')
        return
      }
      // Email is verified, proceed to step 3
      setCurrentStep(3)
      setErrors({})
    } catch (err) {
      setErrors({ verify: 'Unable to check verification status. Please try again.' })
    }
  }

  // Step 3: Save interests and go to step 4
  const handleStep3 = async () => {
    if (interests.length === 0) {
      setErrors({ interests: 'Please select at least one interest' })
      return
    }

    // Save interests
    try {
      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (user) {
        await supabase.from('data_user').update({ 
          interests, 
          terms: form.terms === true 
        }).eq('id', user.id)
      }
    } catch (err) {
      console.error('Interests update error:', err)
    }

    setErrors({})
    setCurrentStep(4)
  }

  const goNext = async () => {
    if (currentStep === 1) {
      await handleStep1()
      return
    }
    
    if (currentStep === 2) {
      await handleStep2()
      return
    }
    
    if (currentStep === 3) {
      await handleStep3()
      return
    }
  }

  const goBack = () => {
    setErrors({})
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const finish = async () => {
    try {
      const t = toast.loading('Finalizing your profile...')
      const { data } = await supabase.auth.getUser()
      
      if (!data?.user) {
        toast.error('Please sign in to continue', { id: t })
        navigate('/signin', { replace: true })
        return
      }

      // Update user profile with interests
      const { error: updateError } = await supabase.from('data_user').update({
        interests: interests,
        terms: form.terms === true
      }).eq('id', data.user.id)

      if (updateError) {
        throw updateError
      }

      toast.success('Profile completed! Redirecting...', { id: t })
      
      // Small delay to show success message
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 500)
    } catch (err) {
      console.error('Profile finalization error:', err)
      toast.error('Could not finalize profile. Please try again.')
      navigate('/signin', { replace: true })
    }
  }

  // Check for Google OAuth flow on mount
  useEffect(() => {
    const checkGoogleOAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const oauthParam = params.get('oauth')
        
        if (oauthParam === 'google') {
          const { data } = await supabase.auth.getUser()
          const user = data?.user
          
          if (user) {
            setOauthGoogle(true)
            setForm(prev => ({
              ...prev,
              name: user.user_metadata?.name?.split(' ')[0] || '',
              prename: user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
              email: user.email || '',
            }))
            window.history.replaceState({}, '', window.location.pathname)
          }
        }
      } catch (err) {
        console.error('Google OAuth check error:', err)
      }
    }
    
    checkGoogleOAuth()
  }, [])

  // Check if user is coming from verification page (step 3 query param)
  useEffect(() => {
    const checkStepParam = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const step = params.get('step')
        
        if (step === '3') {
          // User is coming from verification page, check if they're verified
          const { data } = await supabase.auth.getUser()
          if (data?.user?.email_confirmed_at) {
            // Update form with user metadata
            setForm(prev => ({
              ...prev,
              email: data.user.email || prev.email,
              name: data.user.user_metadata?.name || prev.name,
              prename: data.user.user_metadata?.prename || prev.prename,
              gender: data.user.user_metadata?.gender || prev.gender,
              phone: data.user.user_metadata?.phone || prev.phone
            }))
            
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname)
            setCurrentStep(3)
          } else {
            // Not verified, go back to step 2
            setCurrentStep(2)
            setErrors({ verify: 'Please verify your email first.' })
          }
        }
      } catch (err) {
        console.error('Step param check error:', err)
      }
    }
    
    checkStepParam()
  }, [])

  // Listen for auth state changes (email verification) - only when on step 2
  useEffect(() => {
    // Only listen for auth changes when we're on step 2 (waiting for email verification)
    if (currentStep !== 2) {
      return // Exit early if not on step 2
    }

    let mounted = true
    let hasCheckedInitial = false

    // First, check current auth state
    const checkInitialAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (data?.user?.email_confirmed_at && mounted && currentStep === 2) {
          // User is already verified, go to step 3
          setForm(prev => ({
            ...prev,
            email: data.user.email || prev.email,
            name: data.user.user_metadata?.name || prev.name,
            prename: data.user.user_metadata?.prename || prev.prename,
            gender: data.user.user_metadata?.gender || prev.gender,
            phone: data.user.user_metadata?.phone || prev.phone
          }))
          
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
              terms: form.terms === true
            }, { onConflict: 'id' })
          } catch (err) {
            console.error('Profile creation error:', err)
          }
          
          if (mounted) {
            toast.success('Email verified!')
            setCurrentStep(3)
          }
        }
        hasCheckedInitial = true
      } catch (err) {
        console.error('Initial auth check error:', err)
        hasCheckedInitial = true
      }
    }

    checkInitialAuth()

    // Then listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Skip initial session event if we just checked
      if (!hasCheckedInitial && event === 'INITIAL_SESSION') {
        return
      }

      // Only proceed if we're still on step 2, component is mounted, and email is confirmed
      if (!mounted || currentStep !== 2) return
      
      // Only handle SIGNED_IN events (not TOKEN_REFRESHED or other events)
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        // Update form with user data
        setForm(prev => ({
          ...prev,
          email: session.user.email || prev.email,
          name: session.user.user_metadata?.name || prev.name,
          prename: session.user.user_metadata?.prename || prev.prename,
          gender: session.user.user_metadata?.gender || prev.gender,
          phone: session.user.user_metadata?.phone || prev.phone
        }))
        
        // Create or update user profile
        try {
          await supabase.from('data_user').upsert({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name,
            prename: session.user.user_metadata?.prename,
            gender: session.user.user_metadata?.gender,
            role: 'user',
            phone: session.user.user_metadata?.phone || '',
            interests: [],
            terms: form.terms === true
          }, { onConflict: 'id' })
        } catch (err) {
          console.error('Profile creation error:', err)
        }
        
        if (mounted) {
          toast.success('Email verified!')
          setCurrentStep(3)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [currentStep, form.terms])

  const resendVerificationEmail = async () => {
    try {
      const t = toast.loading('Sending verification email...')
      const siteUrl = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '')
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: form.email,
        options: { 
          emailRedirectTo: `${siteUrl}/verify` 
        }
      })
      
      if (error) {
        toast.error(error.message, { id: t })
        return
      }
      
      toast.success('Verification email sent! Check your inbox.', { id: t })
    } catch (err) {
      toast.error('Failed to resend email')
    }
  }

  return (
    <>
      <Guestnavbar />

      <section className="bg-light min-vh-100 py-5 mt-20" style={{ backgroundImage: 'linear-gradient(180deg, rgba(102,126,234,0.06), rgba(118,75,162,0.06))' }}>
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
                      isVerified={false}
                      errorMessage={errors.verify}
                      onBack={goBack}
                      onResend={resendVerificationEmail}
                      onContinue={goNext}
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
                      <h3 className="fw-bold mb-3 text-dark d-flex align-items-center justify-content-center gap-2">
                        Welcome to Timipay! <span role="img" aria-label="party">🎉</span>
                      </h3>
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