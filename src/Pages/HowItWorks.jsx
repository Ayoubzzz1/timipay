import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import Guestnavbar from '../compoents/Navbars/Guestnavbar'
import Footer from '../compoents/Footer/Footer'
import usePictureInPicture from '../hooks/usePictureInPicture'

function HowItWorks() {
  const videoRef = useRef(null)
  const {
    isPictureInPictureActive,
    isPictureInPictureAvailable,
    togglePictureInPicture,
  } = usePictureInPicture(videoRef)

  return (
    <>
      <Guestnavbar />

      {/* Hero */}
      <section className="position-relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        paddingTop: '90px',
      }}>
        <div className="container text-white py-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className="badge bg-warning text-dark rounded-pill px-3 py-2 mb-3">GUIDE</span>
              <h1 className="display-4 fw-bold mb-3">How Timipay Works</h1>
              <p className="lead opacity-90 mb-4">Create your account, enable Picture‑in‑Picture to watch ads while you work, and withdraw your earnings securely.</p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/signup" className="btn btn-warning fw-semibold px-4 py-2">Create your account</Link>
                <Link to="/signin" className="btn btn-outline-light fw-semibold px-4 py-2">I already have an account</Link>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="bg-white rounded-4 shadow-lg p-3">
                <div className="ratio ratio-16x9 bg-dark rounded-3 overflow-hidden">
                  <video ref={videoRef} autoPlay muted loop playsInline className="w-100 h-100" style={{ objectFit: 'cover' }}>
                    <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" />
                  </video>
                </div>
                <div className="d-flex align-items-center gap-3 mt-3">
                  {isPictureInPictureAvailable ? (
                    <button
                      className={`btn ${isPictureInPictureActive ? 'btn-danger' : 'btn-warning'} fw-semibold`}
                      onClick={() => togglePictureInPicture(!isPictureInPictureActive)}
                    >
                      <i className={`bi ${isPictureInPictureActive ? 'bi-x-circle' : 'bi-pip'} me-2`}></i>
                      {isPictureInPictureActive ? 'Disable PiP' : 'Try Live PiP'}
                    </button>
                  ) : (
                    <div className="alert alert-info mb-0 py-2 px-3" role="alert">
                      <i className="bi bi-info-circle me-2"></i>
                      PiP not supported in this browser
                    </div>
                  )}
                  <span className="text-muted small ms-auto d-flex align-items-center gap-2">
                    <span className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></span>
                    Live Demo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="badge bg-warning text-dark rounded-pill px-3 py-2 mb-2">STEP‑BY‑STEP</span>
            <h2 className="fw-bold display-6 mb-2">From Sign Up to Withdrawal</h2>
            <p className="text-muted">Follow these simple steps to start earning with Picture‑in‑Picture.</p>
          </div>

          <div className="row g-4">
            {[ 
              {step: 1, icon: 'bi-person-plus', title: 'Create your account', desc: 'Sign up with email or continue with Google. We keep your data secure.'},
              {step: 2, icon: 'bi-envelope-check', title: 'Verify your email', desc: 'Click the link we send to your inbox to activate your account.'},
              {step: 3, icon: 'bi-list-check', title: 'Tell us your interests', desc: 'Pick topics you like to get the most relevant ads.'},
              {step: 4, icon: 'bi-pip', title: 'Enable PiP and earn', desc: 'Open an ad and toggle Picture‑in‑Picture. Keep working while the video floats.'},
              {step: 5, icon: 'bi-graph-up-arrow', title: 'Track your earnings', desc: 'See your live balance grow after each ad is watched.'},
              {step: 6, icon: 'bi-wallet2', title: 'Withdraw securely', desc: 'Cash out your balance with supported payment methods.'}
            ].map((s) => (
              <div className="col-md-6 col-lg-4" key={s.step}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start gap-3 mb-2">
                      <div className="bg-warning bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '52px', height: '52px' }}>
                        <i className={`bi ${s.icon} text-warning fs-4`}></i>
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-dark">{s.step}</span>
                          <h5 className="fw-bold mb-0">{s.title}</h5>
                        </div>
                        <p className="text-muted mb-0">{s.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-4">
            <span className="badge bg-warning text-dark rounded-pill px-3 py-2 mb-2">FAQ</span>
            <h3 className="fw-bold">Common questions</h3>
          </div>
          <div className="row g-3">
            {[ 
              {q: 'Do I need to keep the video visible?', a: 'With Picture‑in‑Picture, the video floats above other windows. Keep it playing to earn while you work.'},
              {q: 'Does PiP work on mobile?', a: 'Most modern mobile browsers support PiP. Availability depends on your device and browser.'},
              {q: 'When do I get paid?', a: 'Earnings are credited after each ad completes. Withdraw once you reach the minimum threshold set in your account.'}
            ].map((item, idx) => (
              <div className="col-lg-4" key={idx}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <h6 className="fw-bold mb-2">{item.q}</h6>
                    <p className="text-muted mb-0">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="container text-center text-white py-5">
          <h2 className="fw-bold mb-3">Ready to start earning?</h2>
          <p className="opacity-90 mb-4">Create your account and enable PiP to earn while you work.</p>
          <Link to="/signup" className="btn btn-warning fw-semibold px-5 py-3">Get started</Link>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default HowItWorks


