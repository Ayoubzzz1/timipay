import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import Guestnavbar from '../../compoents/Navbars/Guestnavbar'

function Verified() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [confirmed, setConfirmed] = useState(false)
  const goToSetup = () => {
    navigate('/signup?step=3', { replace: true })
  }

  useEffect(() => {
    (async () => {
      try { await supabase.auth.refreshSession() } catch (_) {}
      try {
        const { data } = await supabase.auth.getUser()
        const u = data?.user
        if (u?.email_confirmed_at || u?.confirmed_at) {
          setConfirmed(true)
        }
      } catch (_) {}
      setChecking(false)
    })()
  }, [])

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
                  {!confirmed && !checking && (
                    <div className="alert alert-warning mt-4 mb-0" role="alert">
                      We could not confirm your email yet. Please try the link again.
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








