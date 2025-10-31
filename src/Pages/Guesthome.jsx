import React, { useState, useEffect, useRef } from 'react';
import usePictureInPicture from '../hooks/usePictureInPicture';
import { Link } from 'react-router-dom';
import Guestnavbar from '../compoents/Navbars/Guestnavbar';
import Footer from '../compoents/Footer/Footer';

function Guesthome() {
  const [earnings, setEarnings] = useState(0);
  const [animateStats, setAnimateStats] = useState(false);
  const [pipDemoActive, setPipDemoActive] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [adsPerDay, setAdsPerDay] = useState(50);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef(null);
  const {
    isPictureInPictureActive,
    isPictureInPictureAvailable,
    togglePictureInPicture,
  } = usePictureInPicture(videoRef);

  useEffect(() => {
    setAnimateStats(true);
    const interval = setInterval(() => {
      setEarnings(prev => (prev + 0.05) % 100);
    }, 50);

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.pageYOffset / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const startPipDemo = () => {
    setPipDemoActive(true);
    setTimeout(() => setPipDemoActive(false), 5000);
  };

  const dailyMin = (adsPerDay * 0.05).toFixed(2);
  const dailyMax = (adsPerDay * 0.25).toFixed(2);
  const monthlyMin = (dailyMin * 30).toFixed(0);
  const monthlyMax = (dailyMax * 30).toFixed(0);

  return (
    <>
      <Guestnavbar />
      {/* Scroll Progress Bar */}
      <div className="position-fixed top-0 start-0 w-100" style={{ height: '4px', zIndex: 10000 }}>
        <div 
          className="h-100 bg-warning"
          style={{ 
            width: `${scrollProgress}%`, 
            transition: 'width 0.1s ease',
            boxShadow: '0 0 10px rgba(255, 193, 7, 0.5)'
          }}
        ></div>
      </div>

      {/* Hero Section */}
      <section className="position-relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        paddingTop: '80px'
      }}>
        {/* Animated Background */}
        <div className="position-absolute w-100 h-100 top-0 start-0" style={{ opacity: 0.08 }}>
          <div className="position-absolute rounded-circle bg-white blur-circle" 
               style={{ width: '400px', height: '400px', top: '5%', left: '5%', animation: 'float 8s ease-in-out infinite' }}></div>
          <div className="position-absolute rounded-circle bg-white blur-circle" 
               style={{ width: '300px', height: '300px', top: '50%', right: '10%', animation: 'float 10s ease-in-out infinite 1s' }}></div>
          <div className="position-absolute rounded-circle bg-white blur-circle" 
               style={{ width: '250px', height: '250px', bottom: '10%', left: '15%', animation: 'float 12s ease-in-out infinite 2s' }}></div>
        </div>

        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center min-vh-100 py-5">
            {/* Left Content */}
            <div className="col-lg-6 mb-5 mb-lg-0 text-white">
              <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
                <span className="badge d-inline-flex align-items-center gap-2 mb-4 px-4 py-3 rounded-pill fs-6 fw-semibold shadow-lg"
                      style={{ 
                        background: 'rgba(255, 193, 7, 0.95)',
                        color: '#1a1a1a',
                        animation: 'pulse-glow 3s ease-in-out infinite'
                      }}>
                  <i className="bi bi-lightning-charge-fill"></i>
                  <span>Earn $5-$50 Daily</span>
                  <i className="bi bi-arrow-right"></i>
                </span>
              </div>
              
              <h1 className="display-1 fw-bold mb-4 fade-in-up" style={{ 
                animationDelay: '0.2s',
                lineHeight: '1.1',
                letterSpacing: '-0.02em'
              }}>
                Turn Your<br/>
                <span className="text-warning position-relative d-inline-block" style={{ 
                  textShadow: '3px 3px 6px rgba(0,0,0,0.3)'
                }}>
                  Screen Time
                  <svg className="position-absolute" style={{ 
                    bottom: '-10px', 
                    left: '0', 
                    width: '100%', 
                    height: '20px',
                    opacity: 0.5
                  }} viewBox="0 0 400 20">
                    <path d="M0,10 Q100,2 200,10 T400,10" stroke="#ffc107" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  </svg>
                </span><br/>
                Into Real Money
              </h1>
              
              <p className="fs-4 mb-4 fade-in-up" style={{ 
                animationDelay: '0.3s', 
                opacity: 0.95,
                lineHeight: '1.6',
                maxWidth: '540px'
              }}>
                Watch ads in <strong className="text-warning">Picture-in-Picture</strong> mode while you work, browse, or play. 
                <strong className="text-warning"> Earn without interrupting your workflow!</strong>
              </p>

              {/* Live Earnings Display */}
              <div className="fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="rounded-4 p-4 mb-4 position-relative overflow-hidden" 
                     style={{ 
                       backdropFilter: 'blur(20px)', 
                       background: 'rgba(0,0,0,0.25)',
                       border: '1px solid rgba(255,193,7,0.2)',
                       boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                     }}>
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <div className="bg-success rounded-circle" style={{ width: '8px', height: '8px', animation: 'pulse 2s infinite' }}></div>
                        <small className="text-white-50">Live Earnings</small>
                      </div>
                      <h3 className="fw-bold mb-0 d-flex align-items-baseline gap-2" style={{ 
                        color: '#ffc107', 
                        textShadow: '0 2px 10px rgba(255,193,7,0.4)',
                        fontFamily: 'monospace'
                      }}>
                        ${earnings.toFixed(2)}
                        <small className="fs-6 text-white-50">/hr</small>
                      </h3>
                    </div>
                    <div className="col-6 text-end">
                      <small className="text-white-50 d-block mb-1">Earning Now</small>
                      <h3 className="text-white fw-bold mb-0 d-flex align-items-baseline justify-content-end gap-1">
                        2,847
                        <i className="bi bi-people-fill fs-6 text-white-50"></i>
                      </h3>
                    </div>
                  </div>
                  
                  {/* Animated Background Gradient */}
                  <div className="position-absolute top-0 start-0 w-100 h-100" style={{
                    background: 'linear-gradient(135deg, rgba(255,193,7,0.1) 0%, rgba(102,126,234,0.1) 100%)',
                    animation: 'shimmer 3s ease-in-out infinite',
                    zIndex: -1
                  }}></div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="d-flex flex-wrap gap-3 mb-4 fade-in-up" style={{ animationDelay: '0.5s' }}>
                <Link to="/signup" className="btn btn-warning btn-lg px-5 py-3 fw-semibold shadow-lg position-relative overflow-hidden hover-lift-scale">
                  <span className="position-relative d-flex align-items-center gap-2">
                    <i className="bi bi-rocket-takeoff-fill"></i>
                    Start Earning Now
                  </span>
                </Link>
                <Link to="/how-it-works" className="btn btn-outline-light btn-lg px-5 py-3 fw-semibold hover-lift">
                  <i className="bi bi-info-circle me-2"></i>
                  How it works
                </Link>
              </div>

              {/* Feature Pills */}
              <div className="d-flex flex-wrap gap-3 fade-in-up" style={{ animationDelay: '0.6s' }}>
                {['Picture-in-Picture Mode', 'Instant Payouts', 'Background Earning'].map((feature, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill" 
                       style={{ 
                         background: 'rgba(255,255,255,0.15)',
                         backdropFilter: 'blur(10px)',
                         border: '1px solid rgba(255,255,255,0.2)'
                       }}>
                    <i className="bi bi-check-circle-fill text-warning fs-5"></i>
                    <span className="text-white fw-medium small">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Mockup */}
            <div className="col-lg-6 fade-in-right">
              <div className="position-relative">
                {/* Main Card */}
                <div className="bg-white rounded-4 shadow-2xl p-4 position-relative" 
                     style={{ 
                       transform: 'perspective(1000px) rotateY(-5deg)',
                       transition: 'transform 0.3s ease'
                     }}>
                  {/* Video Player Area */}
                  <div className="bg-dark rounded-3 p-4 mb-3 position-relative overflow-hidden" style={{ height: '280px' }}>
                    <div className="position-absolute top-50 start-50 translate-middle text-center w-100">
                      <div className="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-lg" 
                           style={{ 
                             width: '90px', 
                             height: '90px', 
                             animation: 'pulse-scale 2s infinite',
                             cursor: 'pointer'
                           }}
                           onClick={() => setIsVideoPlaying(!isVideoPlaying)}>
                        <i className={`bi ${isVideoPlaying ? 'bi-pause-fill' : 'bi-play-fill'} text-white`} style={{ fontSize: '2.5rem' }}></i>
                      </div>
                      <p className="text-white fw-bold mb-1">Watch in PiP & Earn</p>
                      <p className="text-warning fw-bold fs-5 mb-0">+$0.15 per ad</p>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="position-absolute bottom-0 start-0 w-100 p-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-white-50">0:15</small>
                        <small className="text-white-50">0:30</small>
                      </div>
                      <div className="rounded-pill overflow-hidden" style={{ height: '6px', background: 'rgba(255,255,255,0.2)' }}>
                        <div className="bg-warning h-100 rounded-pill" style={{ 
                          width: isVideoPlaying ? '100%' : '60%', 
                          transition: 'width 15s linear'
                        }}></div>
                      </div>
                    </div>

                    {/* Animated Particles */}
                    <div className="position-absolute" style={{ top: '20%', left: '10%', animation: 'float-particle 3s ease-in-out infinite' }}>
                      <div className="bg-warning rounded-circle" style={{ width: '8px', height: '8px', opacity: 0.6 }}></div>
                    </div>
                    <div className="position-absolute" style={{ top: '60%', right: '15%', animation: 'float-particle 4s ease-in-out infinite 1s' }}>
                      <div className="bg-warning rounded-circle" style={{ width: '6px', height: '6px', opacity: 0.5 }}></div>
                    </div>
                  </div>
                  
                  {/* Balance Section */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted d-block mb-1">Your Balance</small>
                      <h4 className="text-success fw-bold mb-0 d-flex align-items-baseline gap-2">
                        $127.50
                        <small className="text-success fs-6 fw-normal">
                          <i className="bi bi-arrow-up"></i> $12.50 today
                        </small>
                      </h4>
                    </div>
                    <button className="btn btn-warning fw-semibold px-4 py-2 shadow-sm hover-lift">
                      <i className="bi bi-cash-coin me-2"></i>
                      Withdraw
                    </button>
                  </div>
                </div>

                {/* Floating PiP Demo */}
                {pipDemoActive && (
                  <div className="position-absolute bg-dark rounded-3 shadow-2xl p-2 border border-warning"
                       style={{ 
                         top: '15%', 
                         right: '5%', 
                         width: '180px', 
                         height: '120px',
                         zIndex: 10,
                         animation: 'pip-float 5s ease-in-out infinite'
                       }}>
                    <div className="position-relative h-100">
                      <div className="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center position-absolute top-50 start-50 translate-middle" 
                           style={{ width: '40px', height: '40px' }}>
                        <i className="bi bi-play-fill text-white fs-5"></i>
                      </div>
                      <div className="position-absolute bottom-0 start-0 w-100 p-2 rounded-bottom-3" 
                           style={{ background: 'rgba(0,0,0,0.8)' }}>
                        <small className="text-warning fw-semibold d-flex align-items-center gap-1">
                          <span className="bg-success rounded-circle" style={{ width: '6px', height: '6px' }}></span>
                          Earning +$0.15
                        </small>
                      </div>
                    </div>
                  </div>
                )}

                {/* Floating Stats - Top Right */}
                <div className="position-absolute bg-success text-white rounded-3 shadow-lg p-3" 
                     style={{ 
                       top: '-15px', 
                       right: '-15px', 
                       animation: 'slide-in-right 1s ease-out 1.2s both',
                       minWidth: '140px'
                     }}>
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-white bg-opacity-25 rounded-circle p-2">
                      <i className="bi bi-pip fs-5"></i>
                    </div>
                    <div>
                      <small className="d-block opacity-75" style={{ fontSize: '0.7rem' }}>PiP Active</small>
                      <strong className="d-block">+$0.25</strong>
                    </div>
                  </div>
                </div>

                {/* Floating Stats - Bottom Left */}
                <div className="position-absolute bg-white rounded-3 shadow-lg p-3 border" 
                     style={{ 
                       bottom: '-15px', 
                       left: '-15px', 
                       animation: 'slide-in-left 1s ease-out 1.2s both',
                       borderColor: 'rgba(255,193,7,0.3) !important'
                     }}>
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-warning bg-opacity-25 rounded-circle p-2">
                      <i className="bi bi-graph-up-arrow text-warning fs-5"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Background</small>
                      <strong className="text-dark d-block">8 ads in PiP</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Bar */}
      <section className="py-4 bg-dark text-white">
        <div className="container">
          <div className="row text-center g-4">
            {[
              { value: '$12.5M+', label: 'Total Paid Out', icon: 'bi-currency-dollar', delay: '0s' },
              { value: '150K+', label: 'Active Earners', icon: 'bi-people-fill', delay: '0.1s' },
              { value: '92%', label: 'Use PiP Mode', icon: 'bi-pip', delay: '0.2s' },
              { value: '$0.25', label: 'Avg. Per Ad', icon: 'bi-graph-up', delay: '0.3s' }
            ].map((stat, idx) => (
              <div key={idx} className="col-6 col-md-3">
                <div className={`stat-card ${animateStats ? 'animate' : ''}`} style={{ animationDelay: stat.delay }}>
                  <i className={`bi ${stat.icon} text-warning fs-3 mb-2 d-block`}></i>
                  <h3 className="fw-bold mb-1 text-warning">{stat.value}</h3>
                  <p className="mb-0 small text-white-50">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live PiP Demo Section */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="card border-0 shadow-2xl rounded-4 overflow-hidden">
                <div className="ratio ratio-16x9 bg-dark">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  >
                    <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" />
                  </video>
                </div>
                <div className="card-body bg-light p-4">
                  <div className="d-flex flex-wrap align-items-center gap-3">
                    {isPictureInPictureAvailable ? (
                      <button 
                        className={`btn ${isPictureInPictureActive ? 'btn-danger' : 'btn-warning'} fw-semibold px-4 py-2 hover-lift-scale`}
                        onClick={() => togglePictureInPicture(!isPictureInPictureActive)}
                      >
                        <i className={`bi ${isPictureInPictureActive ? 'bi-x-circle' : 'bi-pip'} me-2`}></i>
                        {isPictureInPictureActive ? 'Disable PiP' : 'Try Live PiP Demo'}
                      </button>
                    ) : (
                      <div className="alert alert-info mb-0 py-2 px-3" role="alert">
                        <i className="bi bi-info-circle me-2"></i>
                        PiP not supported in this browser
                      </div>
                    )}
                    <div className="ms-auto d-flex align-items-center gap-2 text-muted small">
                      <div className="bg-success rounded-circle" style={{ width: '8px', height: '8px', animation: 'pulse 2s infinite' }}></div>
                      <span>Live Demo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-6">
              <span className="badge bg-warning text-dark px-3 py-2 mb-3 rounded-pill">
                <i className="bi bi-play-circle me-1"></i>
                INTERACTIVE DEMO
              </span>
              <h2 className="fw-bold mb-4 display-6">Try Picture-in-Picture Right Now</h2>
              <p className="text-muted mb-4 fs-5">
                Click the PiP button to pop the video into a floating window. Move it anywhere and continue browsing while earning.
              </p>
              
              <div className="row g-3 mb-4">
                {[
                  { icon: 'bi-browser-chrome', text: 'Works while browsing' },
                  { icon: 'bi-controller', text: 'Seamless controls' },
                  { icon: 'bi-shield-check', text: 'No interruptions' }
                ].map((item, idx) => (
                  <div key={idx} className="col-12">
                    <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light hover-lift">
                      <div className="bg-warning bg-opacity-25 rounded-circle p-3">
                        <i className={`bi ${item.icon} text-warning fs-4`}></i>
                      </div>
                      <span className="fw-medium">{item.text}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link to="/signup" className="btn btn-primary btn-lg fw-semibold px-5 py-3 hover-lift-scale">
                <i className="bi bi-pip me-2"></i>
                Start PiP Earning
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Picture-in-Picture Focus */}
      <section className="py-5 bg-light">
        <div className="container py-5">
          <div className="text-center mb-5">
            <span className="badge bg-warning text-dark px-4 py-2 mb-3 rounded-pill fs-6">
              <i className="bi bi-lightbulb-fill me-2"></i>
              PICTURE-IN-PICTURE TECHNOLOGY
            </span>
            <h2 className="display-5 fw-bold mb-3">Earn Money While You Work</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Our exclusive Picture-in-Picture technology lets you earn without interrupting your workflow
            </p>
          </div>

          <div className="row g-4 mb-5">
            {[
              { 
                icon: 'bi-lightning-charge', 
                title: 'True Multitasking', 
                desc: 'Watch ads in a small floating window while continuing your normal activities.',
                color: 'warning'
              },
              { 
                icon: 'bi-graph-up', 
                title: '3x More Earning Time', 
                desc: 'Users earn 3x more with PiP compared to traditional full-screen ads.',
                color: 'success'
              },
              { 
                icon: 'bi-cpu', 
                title: 'Zero Productivity Loss', 
                desc: 'Continue working, browsing, or gaming while earning money passively.',
                color: 'primary'
              },
              { 
                icon: 'bi-shield-check', 
                title: 'Automatic Detection', 
                desc: 'System automatically detects PiP mode and optimizes your earnings.',
                color: 'info'
              }
            ].map((item, idx) => (
              <div key={idx} className="col-lg-6">
                <div className="card border-0 shadow-sm h-100 hover-lift" style={{ transition: 'all 0.3s ease' }}>
                  <div className="card-body p-4">
                    <div className="d-flex gap-3">
                      <div className={`bg-${item.color} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0`} 
                           style={{ width: '60px', height: '60px' }}>
                        <i className={`bi ${item.icon} text-${item.color} fs-3`}></i>
                      </div>
                      <div>
                        <h5 className="fw-bold mb-2">{item.title}</h5>
                        <p className="text-muted mb-0">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Steps */}
          <div className="row g-4 mt-3">
            <div className="col-12 text-center mb-4">
              <h3 className="fw-bold">How Picture-in-Picture Works</h3>
            </div>
            
            {[
              { icon: 'bi-play-btn', step: '1', title: 'Start Any Video Ad', desc: 'Click play on any video from our dashboard' },
              { icon: 'bi-arrows-angle-contract', step: '2', title: 'Activate PiP Mode', desc: 'Click the PiP button to detach the video' },
              { icon: 'bi-laptop', step: '3', title: 'Continue Your Work', desc: 'Drag the window anywhere and keep earning' }
            ].map((item, idx) => (
              <div key={idx} className="col-lg-4">
                <div className="text-center h-100 p-4">
                  <div className="position-relative d-inline-block mb-4">
                    <div className="bg-warning rounded-circle d-flex align-items-center justify-content-center shadow-lg mx-auto" 
                         style={{ width: '90px', height: '90px' }}>
                      <i className={`bi ${item.icon} text-white fs-2`}></i>
                    </div>
                    <span className="position-absolute top-0 end-0 bg-dark text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" 
                          style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}>
                      {item.step}
                    </span>
                  </div>
                  <h5 className="fw-bold mb-3">{item.title}</h5>
                  <p className="text-muted mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earning Calculator */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="badge bg-warning text-dark px-3 py-2 mb-3 rounded-pill">
                <i className="bi bi-calculator me-1"></i>
                EARNING CALCULATOR
              </span>
              <h2 className="display-6 fw-bold mb-4">Calculate Your PiP Earnings</h2>
              <p className="text-muted mb-4 fs-5">
                See how much you can earn using Picture-in-Picture mode while working or browsing.
              </p>

              <div className="card border-0 shadow-lg mb-4 rounded-4">
                <div className="card-body p-4">
                  <div className="mb-4">
                    <label className="form-label fw-semibold mb-3 d-flex justify-content-between">
                      <span>PiP Ads per day</span>
                      <span className="text-warning">{adsPerDay} ads</span>
                    </label>
                    <input 
                      type="range" 
                      className="form-range" 
                      min="10" 
                      max="100" 
                      step="10" 
                      value={adsPerDay}
                      onChange={(e) => setAdsPerDay(Number(e.target.value))}
                      style={{ cursor: 'pointer' }}
                    />
                    <div className="d-flex justify-content-between text-muted small mt-2">
                      <span>10</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                  </div>

                  <div className="rounded-4 p-4 text-center" 
                       style={{ background: 'linear-gradient(135deg, rgba(255,193,7,0.1) 0%, rgba(255,193,7,0.05) 100%)' }}>
                    <small className="text-muted d-block mb-2">Estimated Daily Earnings</small>
                    <h2 className="text-warning fw-bold mb-2 display-6">
                      ${dailyMin} - ${dailyMax}
                    </h2>
                    <p className="mb-0 small text-muted">
                      <strong>Monthly:</strong> ${monthlyMin} - ${monthlyMax}
                    </p>
                  </div>
                </div>
              </div>

              <div className="alert alert-success border-0 shadow-sm rounded-3 mb-0">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-pip fs-4"></i>
                  <div>
                    <strong className="d-block">PiP Advantage:</strong>
                    <span className="small">Earn 3x more by watching ads while working in PiP mode!</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="row g-3">
                {[
                  { icon: 'bi-pip', title: 'PiP Multitasking', desc: 'Earn while working, browsing or gaming', gradient: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)' },
                  { icon: 'bi-lightning-charge-fill', title: 'Instant Payment', desc: 'Get paid immediately after each ad', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                  { icon: 'bi-phone-fill', title: 'Mobile PiP', desc: 'PiP works on mobile devices too', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
                  { icon: 'bi-shield-check', title: '100% Secure', desc: 'Your data is always protected', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }
                ].map((card, idx) => (
                  <div key={idx} className="col-6">
                    <div className="card border-0 shadow-sm h-100 hover-lift-scale" style={{ transition: 'all 0.3s ease' }}>
                      <div className="card-body p-4 text-center">
                        <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                             style={{ 
                               width: '60px', 
                               height: '60px',
                               background: card.gradient
                             }}>
                          <i className={`bi ${card.icon} text-white fs-4`}></i>
                        </div>
                        <h6 className="fw-bold mb-2">{card.title}</h6>
                        <p className="text-muted small mb-0">{card.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-5 bg-light">
        <div className="container py-5">
          <div className="text-center mb-5">
            <span className="badge bg-warning text-dark px-4 py-2 mb-3 rounded-pill">
              <i className="bi bi-star-fill me-2"></i>
              SUCCESS STORIES
            </span>
            <h2 className="display-6 fw-bold mb-3">What Our Users Say</h2>
            <p className="text-muted">Join thousands earning daily with PiP mode</p>
          </div>

          <div className="row g-4">
            {[
              {
                name: 'Sarah M.',
                role: 'Freelance Designer',
                avatar: 'SM',
                rating: 5,
                text: 'I use PiP mode while working on designs. Made $450 last month without any interruption to my workflow!',
                earnings: '$450/mo',
                color: '#667eea'
              },
              {
                name: 'Michael R.',
                role: 'Software Developer',
                avatar: 'MR',
                rating: 5,
                text: 'The Picture-in-Picture feature is genius. I keep it running in the corner while coding. Easy passive income!',
                earnings: '$380/mo',
                color: '#764ba2'
              },
              {
                name: 'Jessica L.',
                role: 'Content Writer',
                avatar: 'JL',
                rating: 5,
                text: 'Best side hustle ever! PiP lets me earn while researching and writing. Already withdrawn $600 this month.',
                earnings: '$600/mo',
                color: '#ffc107'
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="col-lg-4">
                <div className="card border-0 shadow-sm h-100 hover-lift" style={{ transition: 'all 0.3s ease' }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                           style={{ 
                             width: '50px', 
                             height: '50px',
                             background: testimonial.color
                           }}>
                        {testimonial.avatar}
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-0">{testimonial.name}</h6>
                        <small className="text-muted">{testimonial.role}</small>
                      </div>
                      <span className="badge bg-success fw-semibold">{testimonial.earnings}</span>
                    </div>
                    
                    <div className="mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <i key={i} className="bi bi-star-fill text-warning"></i>
                      ))}
                    </div>
                    
                    <p className="text-muted mb-0">"{testimonial.text}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
    

     

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-particle {
          0%, 100% { transform: translate(0, 0); opacity: 0.6; }
          50% { transform: translate(10px, -10px); opacity: 0.3; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(255, 193, 7, 0.5),
                        0 0 40px rgba(255, 193, 7, 0.3);
          }
          50% { 
            box-shadow: 0 0 30px rgba(255, 193, 7, 0.8),
                        0 0 60px rgba(255, 193, 7, 0.5);
          }
        }
        
        @keyframes pip-float {
          0% { transform: translate(0, 0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(-250px, -100px) scale(0.9); opacity: 0; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .fade-in-up {
          animation: fade-in-up 0.8s ease-out backwards;
        }
        
        .fade-in-right {
          animation: fade-in-right 1s ease-out 0.3s backwards;
        }
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.2) !important;
        }
        
        .hover-lift-scale {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .hover-lift-scale:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 15px 40px rgba(0,0,0,0.2) !important;
        }
        
        .hover-lift-scale::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        
        .hover-lift-scale:hover::before {
          left: 100%;
        }
        
        .blur-circle {
          filter: blur(60px);
        }
        
        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
        }
        
        .stat-card {
          opacity: 0;
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .form-range::-webkit-slider-thumb {
          background: #ffc107;
          cursor: pointer;
        }
        
        .form-range::-moz-range-thumb {
          background: #ffc107;
          cursor: pointer;
        }
        
        .card {
          transition: all 0.3s ease;
        }
        
        @media (max-width: 768px) {
          .display-1 {
            font-size: 3rem;
          }
          .display-3 {
            font-size: 2.5rem;
          }
          .display-6 {
            font-size: 1.75rem;
          }
        }
      `}</style>
      <Footer />
    </>
  );
}

export default Guesthome;