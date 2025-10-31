import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

function Guestnavbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // Mock notifications count
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();

  const readCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  };

  const writeCookie = (name, value, days = 7) => {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`;
  };

  const clearCookie = (name) => {
    document.cookie = `${name}=; path=/; max-age=0`;
  };

  const isOnboardingComplete = (profile) => {
    try {
      const interests = Array.isArray(profile?.interests) ? profile.interests : [];
      const terms = !!profile?.terms;
      return interests.length > 0 && terms === true;
    } catch (_) {
      return false;
    }
  };

  useEffect(() => {
    // Handle scroll effect and active section
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);

      // Update active section based on scroll position
      const sections = ['home', 'about', 'how-it-works', 'pricing'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Optimistic UI: hydrate from cookie immediately
    try {
      const cached = readCookie('tp_user');
      if (cached) {
        const parsed = JSON.parse(cached);
        setUser(parsed);
      }
    } catch (_) {}

    // Load current session user
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data?.user;
      if (!u) return;
      try {
        const { data: profile } = await supabase
          .from('data_user')
          .select('id, interests, terms, name, prename')
          .eq('id', u.id)
          .maybeSingle();
        if (isOnboardingComplete(profile)) {
          const minimal = { id: u.id, email: u.email, user_metadata: u.user_metadata || {} };
          setUser(minimal);
          writeCookie('tp_user', JSON.stringify(minimal));
        } else {
          setUser(null);
          clearCookie('tp_user');
        }
      } catch (_) {
        setUser(null);
        clearCookie('tp_user');
      }
    });

    // Subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user || null;
      if (!u) {
        setUser(null);
        clearCookie('tp_user');
        return;
      }
      supabase
        .from('data_user')
        .select('id, interests, terms, name, prename')
        .eq('id', u.id)
        .maybeSingle()
        .then(({ data: profile }) => {
          if (isOnboardingComplete(profile)) {
            const minimal = { id: u.id, email: u.email, user_metadata: u.user_metadata || {} };
            setUser(minimal);
            writeCookie('tp_user', JSON.stringify(minimal));
          } else {
            setUser(null);
            clearCookie('tp_user');
          }
        })
        .catch(() => {
          setUser(null);
          clearCookie('tp_user');
        });
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearCookie('tp_user');
    setUser(null);
    setIsDropdownOpen(false);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // navbar height
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
    closeDrawer();
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: 'bi-house-fill', href: '#' },
    { id: 'about', label: 'About', icon: 'bi-info-circle-fill', href: '#about' },
    { id: 'howitworks_page', label: 'How it Works', icon: 'bi-play-circle-fill', href: '/how-it-works', isRoute: true },
    { id: 'pricing', label: 'Pricing', icon: 'bi-tag-fill', href: '#pricing' }
  ];

  return (
    <>
      {/* Main Navbar */}
      <nav className={`navbar navbar-expand-lg fixed-top transition-all ${scrolled ? 'navbar-scrolled' : 'navbar-top'}`}>
        <div className="container">
          {/* Brand Logo */}
          <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
            <div className="logo-wrapper">
              <div className="logo-icon">
                <i className="bi bi-lightning-charge-fill"></i>
              </div>
              <div className="logo-text">
                <span className="text-dark">Timi</span>
                <span className="text-warning">pay</span>
              </div>
              {user && (
                <div className="premium-badge">
                  <i className="bi bi-star-fill"></i>
                </div>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="d-none d-lg-flex align-items-center flex-grow-1 justify-content-between">
            {/* Center - Navigation Links */}
            <ul className="navbar-nav mx-auto mb-0">
              {navItems.map((item) => (
                <li key={item.id} className="nav-item">
                  {item.isRoute ? (
                    <Link 
                      className={`nav-link nav-link-custom ${location.pathname === item.href ? 'active' : ''}`}
                      to={item.href}
                    >
                      <i className={`${item.icon} me-1`}></i>
                      {item.label}
                    </Link>
                  ) : (
                    <a 
                      className={`nav-link nav-link-custom ${activeSection === item.id ? 'active' : ''}`}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(item.id);
                      }}
                    >
                      <i className={`${item.icon} me-1`}></i>
                      {item.label}
                      {activeSection === item.id && (
                        <div className="active-pulse"></div>
                      )}
                    </a>
                  )}
                </li>
              ))}
            </ul>

            {/* Right Side - Auth/User */}
            <div className="d-flex align-items-center gap-3">
              {/* Notification Bell */}
              {user && (
                <div className="notification-wrapper">
                  <button className="notification-btn">
                    <i className="bi bi-bell-fill"></i>
                    {notifications > 0 && (
                      <span className="notification-badge">{notifications}</span>
                    )}
                  </button>
                </div>
              )}

              {!user ? (
                <>
                  <Link to="/signin" className="btn btn-outline-dark btn-custom px-4">
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Sign In
                  </Link>
                  <Link to="/signup" className="btn btn-warning btn-custom-primary px-4">
                    <i className="bi bi-rocket-takeoff-fill me-2"></i>
                    Get Started
                  </Link>
                </>
              ) : (
                <div className="user-dropdown-wrapper">
                  <div 
                    className="user-profile-badge dropdown-trigger"
                    onClick={toggleDropdown}
                    onMouseEnter={() => setIsDropdownOpen(true)}
                  >
                    <div className="user-avatar">
                      <span className="avatar-text">
                        {(user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}
                      </span>
                      <div className="online-indicator"></div>
                    </div>
                    <div className="user-info">
                      <span className="user-name">{user.user_metadata?.name || 'User'}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                    <i className={`bi bi-chevron-down dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}></i>
                  </div>

                  {/* User Dropdown Menu */}
                  {isDropdownOpen && (
                    <div 
                      className="user-dropdown-menu"
                      onMouseLeave={closeDropdown}
                    >
                      <div className="dropdown-header">
                        <div className="user-avatar-small">
                          <span className="avatar-text">
                            {(user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="user-info-small">
                          <div className="user-name">{user.user_metadata?.name || 'User'}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>

                      <div className="dropdown-divider"></div>

                      <Link to="/dashboard" className="dropdown-item" onClick={closeDropdown}>
                        <i className="bi bi-speedometer2"></i>
                        Dashboard
                      </Link>
                      <Link to="/profile" className="dropdown-item" onClick={closeDropdown}>
                        <i className="bi bi-person"></i>
                        Profile Settings
                      </Link>
                      <Link to="/earnings" className="dropdown-item" onClick={closeDropdown}>
                        <i className="bi bi-wallet2"></i>
                        My Earnings
                      </Link>
                      <Link to="/pip-mode" className="dropdown-item" onClick={closeDropdown}>
                        <i className="bi bi-pip"></i>
                        PiP Mode
                      </Link>

                      <div className="dropdown-divider"></div>

                      <div className="dropdown-item" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right"></i>
                        Sign Out
                      </div>

                      <div className="dropdown-footer">
                        <div className="earnings-preview">
                          <small>Available Balance</small>
                          <div className="earnings-amount">$47.50</div>
                        </div>
                        <Link to="/withdraw" className="btn-withdraw" onClick={closeDropdown}>
                          Withdraw
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn d-lg-none"
            type="button"
            onClick={toggleDrawer}
            aria-label="Toggle navigation"
          >
            <span className={`menu-icon ${isDrawerOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${isDrawerOpen ? 'drawer-open' : ''}`}>
        <div 
          className={`drawer-backdrop ${isDrawerOpen ? 'backdrop-open' : ''}`}
          onClick={closeDrawer}
        ></div>

        <div className={`drawer-content ${isDrawerOpen ? 'content-open' : ''}`}>
          {/* Drawer Header */}
          <div className="drawer-header">
            <Link className="navbar-brand fw-bold d-flex align-items-center" to="/" onClick={closeDrawer}>
              <div className="logo-wrapper">
                <div className="logo-icon">
                  <i className="bi bi-lightning-charge-fill"></i>
                </div>
                <div className="logo-text">
                  <span className="text-dark">Timi</span>
                  <span className="text-warning">pay</span>
                </div>
              </div>
            </Link>
            <button 
              className="close-drawer-btn" 
              onClick={closeDrawer}
              aria-label="Close"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* Drawer Body */}
          <div className="drawer-body">
            {/* User Info (if logged in) */}
            {user && (
              <div className="drawer-user-section">
                <div className="user-profile-card">
                  <div className="user-avatar-large">
                    <span className="avatar-text">
                      {(user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                    <div className="online-indicator"></div>
                  </div>
                  <div className="user-info-large">
                    <h6 className="mb-1">{user.user_metadata?.name || 'User'}</h6>
                    <p className="mb-0 small text-muted">{user.email}</p>
                    <div className="earnings-badge">
                      <i className="bi bi-wallet2 me-1"></i>
                      $47.50 available
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="drawer-nav-section">
              <h6 className="drawer-section-title">Menu</h6>
              <ul className="drawer-nav">
                {navItems.map((item) => (
                  <li key={item.id}>
                    {item.isRoute ? (
                      <Link 
                        to={item.href}
                        className={`drawer-nav-link ${location.pathname === item.href ? 'active' : ''}`}
                        onClick={closeDrawer}
                      >
                        <div className="nav-link-icon">
                          <i className={item.icon}></i>
                        </div>
                        <span>{item.label}</span>
                      </Link>
                    ) : (
                      <a 
                        href={item.href}
                        className={`drawer-nav-link ${activeSection === item.id ? 'active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection(item.id);
                        }}
                      >
                        <div className="nav-link-icon">
                          <i className={item.icon}></i>
                        </div>
                        <span>{item.label}</span>
                        {activeSection === item.id && (
                          <div className="active-dot"></div>
                        )}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="drawer-actions-section">
              <h6 className="drawer-section-title">Quick Actions</h6>
              <div className="quick-actions-grid">
                <a 
                  href="#pip-demo" 
                  className="quick-action-card"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('how-it-works');
                  }}
                >
                  <i className="bi bi-pip"></i>
                  <span>Start PiP</span>
                </a>
                <Link to="/earnings" className="quick-action-card" onClick={closeDrawer}>
                  <i className="bi bi-wallet2"></i>
                  <span>Earnings</span>
                </Link>
                <a 
                  href="#faq" 
                  className="quick-action-card"
                  onClick={(e) => {
                    e.preventDefault();
                    // Scroll to FAQ section
                    const element = document.getElementById('faq');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                    closeDrawer();
                  }}
                >
                  <i className="bi bi-question-circle"></i>
                  <span>Help</span>
                </a>
                <Link to="/settings" className="quick-action-card" onClick={closeDrawer}>
                  <i className="bi bi-gear"></i>
                  <span>Settings</span>
                </Link>
              </div>
            </div>

            {/* Stats Section for logged in users */}
            {user && (
              <div className="drawer-stats-section">
                <h6 className="drawer-section-title">Today's Stats</h6>
                <div className="stats-grid">
                  <div className="stat-item">
                    <i className="bi bi-play-btn-fill text-primary"></i>
                    <div>
                      <div className="stat-value">12</div>
                      <div className="stat-label">Ads Watched</div>
                    </div>
                  </div>
                  <div className="stat-item">
                    <i className="bi bi-currency-dollar text-success"></i>
                    <div>
                      <div className="stat-value">$3.75</div>
                      <div className="stat-label">Earned</div>
                    </div>
                  </div>
                  <div className="stat-item">
                    <i className="bi bi-clock text-warning"></i>
                    <div>
                      <div className="stat-value">45m</div>
                      <div className="stat-label">Time Spent</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Auth Buttons */}
            <div className="drawer-auth-section">
              {!user ? (
                <>
                  <Link 
                    to="/signin"
                    className="btn btn-outline-dark w-100 mb-2 btn-drawer"
                    onClick={closeDrawer}
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Sign In
                  </Link>
                  <Link 
                    to="/signup"
                    className="btn btn-warning w-100 btn-drawer-primary"
                    onClick={closeDrawer}
                  >
                    <i className="bi bi-rocket-takeoff-fill me-2"></i>
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/dashboard"
                    className="btn btn-warning w-100 mb-2 btn-drawer-primary"
                    onClick={closeDrawer}
                  >
                    <i className="bi bi-speedometer2 me-2"></i>
                    Dashboard
                  </Link>
                  <button 
                    className="btn btn-outline-danger w-100 btn-drawer"
                    onClick={() => { handleLogout(); closeDrawer(); }}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="drawer-footer">
              <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
                <a href="#" className="social-link">
                  <i className="bi bi-twitter"></i>
                </a>
                <a href="#" className="social-link">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="#" className="social-link">
                  <i className="bi bi-instagram"></i>
                </a>
                <a href="#" className="social-link">
                  <i className="bi bi-linkedin"></i>
                </a>
              </div>
              <p className="text-muted small text-center mb-0">
                © 2024 Timipay. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Enhanced Navbar Transitions */
        .navbar {
          padding: 1rem 0;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }

        .navbar-scrolled {
          padding: 0.5rem 0;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 0.95);
        }

        .navbar-top {
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        /* Enhanced Logo Styling */
        .logo-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
        }

        .logo-icon {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.3rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .navbar-brand:hover .logo-icon {
          transform: rotate(15deg) scale(1.1);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .logo-text {
          font-size: 1.6rem;
          line-height: 1;
          font-weight: 800;
          background: linear-gradient(135deg, #1a202c 0%, #4a5568 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .premium-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 16px;
          height: 16px;
          background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.5rem;
          color: white;
          border: 2px solid white;
          animation: pulse-gold 2s infinite;
        }

        @keyframes pulse-gold {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        /* Enhanced Desktop Nav Links */
        .nav-link-custom {
          color: #4a5568;
          font-weight: 600;
          padding: 0.75rem 1.25rem;
          margin: 0 0.25rem;
          border-radius: 12px;
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          align-items: center;
          background: transparent;
        }

        .nav-link-custom i {
          font-size: 0.9rem;
          opacity: 0.8;
          transition: all 0.3s ease;
        }

        .nav-link-custom:hover {
          color: #1a202c;
          background: rgba(255, 193, 7, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 193, 7, 0.2);
        }

        .nav-link-custom:hover i {
          opacity: 1;
          transform: scale(1.1);
        }

        .nav-link-custom.active {
          color: #1a202c;
          background: rgba(255, 193, 7, 0.2);
          box-shadow: 0 4px 15px rgba(255, 193, 7, 0.25);
        }

        .active-pulse {
          position: absolute;
          top: 50%;
          right: 0.5rem;
          width: 6px;
          height: 6px;
          background: #ffc107;
          border-radius: 50%;
          transform: translateY(-50%);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translateY(-50%) scale(1); }
          50% { opacity: 0.7; transform: translateY(-50%) scale(1.2); }
        }

        /* Enhanced Custom Buttons */
        .btn-custom {
          font-weight: 700;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          transition: all 0.3s ease;
          border: 2px solid #2d3748;
          background: transparent;
          color: #2d3748;
          position: relative;
          overflow: hidden;
        }

        .btn-custom::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }

        .btn-custom:hover::before {
          left: 100%;
        }

        .btn-custom:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          background: #2d3748;
          color: white;
        }

        .btn-custom-primary {
          font-weight: 700;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
          border: none;
          color: white;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 193, 7, 0.4);
          position: relative;
          overflow: hidden;
        }

        .btn-custom-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.5s;
        }

        .btn-custom-primary:hover::before {
          left: 100%;
        }

        .btn-custom-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(255, 193, 7, 0.5);
          background: linear-gradient(135deg, #ffca28 0%, #ffb74d 100%);
        }

        /* Notification Button */
        .notification-wrapper {
          position: relative;
        }

        .notification-btn {
          background: none;
          border: none;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4a5568;
          transition: all 0.3s ease;
          position: relative;
          background: rgba(255, 193, 7, 0.1);
        }

        .notification-btn:hover {
          background: rgba(255, 193, 7, 0.2);
          color: #1a202c;
          transform: translateY(-2px);
        }

        .notification-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #e53e3e;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-3px); }
          60% { transform: translateY(-2px); }
        }

        /* Enhanced User Profile Badge */
        .user-dropdown-wrapper {
          position: relative;
        }

        .user-profile-badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 193, 7, 0.1);
          border-radius: 16px;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          cursor: pointer;
          position: relative;
        }

        .user-profile-badge:hover {
          background: rgba(255, 193, 7, 0.15);
          border-color: rgba(255, 193, 7, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(255, 193, 7, 0.2);
        }

        .user-avatar {
          position: relative;
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .avatar-text {
          color: white;
          font-weight: 800;
          font-size: 1.1rem;
        }

        .online-indicator {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 14px;
          height: 14px;
          background: #10b981;
          border: 2px solid white;
          border-radius: 50%;
          animation: pulse-indicator 2s infinite;
        }

        @keyframes pulse-indicator {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .user-info {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .user-name {
          font-weight: 700;
          color: #1a202c;
          font-size: 0.95rem;
        }

        .user-email {
          font-size: 0.8rem;
          color: #718096;
        }

        .dropdown-arrow {
          transition: transform 0.3s ease;
          font-size: 0.8rem;
          color: #718096;
        }

        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        /* User Dropdown Menu */
        .user-dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(0, 0, 0, 0.08);
          min-width: 280px;
          z-index: 1000;
          animation: dropdownSlide 0.3s ease;
        }

        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-header {
          padding: 1.25rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          border-radius: 16px 16px 0 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar-small {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .user-avatar-small .avatar-text {
          font-size: 1.2rem;
        }

        .user-info-small .user-name {
          font-weight: 700;
          color: #1a202c;
          font-size: 1rem;
        }

        .user-info-small .user-email {
          font-size: 0.85rem;
          color: #718096;
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.08);
          margin: 0.5rem 0;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          color: #4a5568;
          text-decoration: none;
          transition: all 0.3s ease;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }

        .dropdown-item:hover {
          background: rgba(255, 193, 7, 0.1);
          color: #1a202c;
          padding-left: 1.5rem;
        }

        .dropdown-item i {
          width: 20px;
          color: #ffc107;
        }

        .dropdown-footer {
          padding: 1rem 1.25rem;
          background: rgba(255, 193, 7, 0.05);
          border-radius: 0 0 16px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .earnings-preview small {
          color: #718096;
          font-size: 0.8rem;
        }

        .earnings-amount {
          font-weight: 800;
          color: #10b981;
          font-size: 1.1rem;
        }

        .btn-withdraw {
          background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }

        .btn-withdraw:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
        }

        /* Enhanced Mobile Menu Button */
        .mobile-menu-btn {
          background: none;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          z-index: 10001;
          background: rgba(255, 193, 7, 0.1);
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .mobile-menu-btn:hover {
          background: rgba(255, 193, 7, 0.2);
          transform: scale(1.05);
        }

        .menu-icon {
          width: 28px;
          height: 20px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .menu-icon span {
          display: block;
          width: 100%;
          height: 3px;
          background: #1a202c;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .menu-icon.open span:nth-child(1) {
          transform: rotate(45deg) translate(6px, 6px);
          background: #ffc107;
        }

        .menu-icon.open span:nth-child(2) {
          opacity: 0;
        }

        .menu-icon.open span:nth-child(3) {
          transform: rotate(-45deg) translate(6px, -6px);
          background: #ffc107;
        }

        /* Enhanced Mobile Drawer */
        .mobile-drawer {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10000;
          pointer-events: none;
        }

        .drawer-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          backdrop-filter: blur(8px);
        }

        .backdrop-open {
          opacity: 1;
          pointer-events: all;
        }

        .drawer-content {
          position: absolute;
          top: 0;
          right: -100%;
          width: 90%;
          max-width: 400px;
          height: 100%;
          background: white;
          transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          overflow-y: auto;
          box-shadow: -10px 0 60px rgba(0, 0, 0, 0.25);
        }

        .content-open {
          right: 0;
          pointer-events: all;
        }

        /* Enhanced Drawer Header */
        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }

        .close-drawer-btn {
          background: rgba(0, 0, 0, 0.05);
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .close-drawer-btn:hover {
          background: rgba(0, 0, 0, 0.1);
          transform: rotate(90deg);
        }

        /* Enhanced Drawer Body */
        .drawer-body {
          padding: 1rem;
        }

        /* Enhanced User Section */
        .drawer-user-section {
          margin-bottom: 1.5rem;
        }

        .user-profile-card {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-radius: 20px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border: 2px solid rgba(102, 126, 234, 0.15);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
        }

        .user-avatar-large {
          position: relative;
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .user-avatar-large .avatar-text {
          font-size: 1.75rem;
        }

        .user-info-large h6 {
          font-weight: 800;
          color: #1a202c;
          margin-bottom: 0.25rem;
        }

        .earnings-badge {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          margin-top: 0.5rem;
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        /* Enhanced Drawer Navigation */
        .drawer-nav-section {
          margin-bottom: 1.5rem;
        }

        .drawer-section-title {
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #718096;
          margin-bottom: 0.75rem;
          padding: 0 0.5rem;
        }

        .drawer-nav {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .drawer-nav li {
          margin-bottom: 0.5rem;
        }

        .drawer-nav-link {
          display: flex;
          align-items: center;
          padding: 1rem 1.25rem;
          border-radius: 14px;
          color: #4a5568;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          gap: 0.75rem;
          position: relative;
        }

        .drawer-nav-link:hover {
          background: rgba(255, 193, 7, 0.15);
          color: #1a202c;
          transform: translateX(8px);
        }

        .drawer-nav-link.active {
          background: rgba(255, 193, 7, 0.2);
          color: #1a202c;
          box-shadow: 0 4px 15px rgba(255, 193, 7, 0.2);
        }

        .nav-link-icon {
          width: 44px;
          height: 44px;
          background: rgba(255, 193, 7, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: #ffc107;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .drawer-nav-link.active .nav-link-icon {
          background: #ffc107;
          color: white;
          transform: scale(1.1);
        }

        .active-dot {
          width: 8px;
          height: 8px;
          background: #ffc107;
          border-radius: 50%;
          margin-left: auto;
          animation: pulse 2s infinite;
        }

        /* Enhanced Quick Actions */
        .drawer-actions-section {
          margin-bottom: 1.5rem;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .quick-action-card {
          background: rgba(255, 193, 7, 0.05);
          border: 2px solid rgba(255, 193, 7, 0.1);
          border-radius: 14px;
          padding: 1.25rem 0.75rem;
          text-align: center;
          text-decoration: none;
          color: #4a5568;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .quick-action-card:hover {
          background: rgba(255, 193, 7, 0.15);
          border-color: rgba(255, 193, 7, 0.3);
          color: #1a202c;
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(255, 193, 7, 0.2);
        }

        .quick-action-card i {
          font-size: 1.75rem;
          color: #ffc107;
        }

        .quick-action-card span {
          font-size: 0.9rem;
          font-weight: 700;
        }

        /* Stats Section */
        .drawer-stats-section {
          margin-bottom: 1.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .stat-item {
          background: rgba(102, 126, 234, 0.05);
          border: 1px solid rgba(102, 126, 234, 0.1);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stat-item i {
          font-size: 1.25rem;
        }

        .stat-value {
          font-weight: 800;
          color: #1a202c;
          font-size: 1.1rem;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #718096;
          margin-top: 0.25rem;
        }

        /* Enhanced Auth Buttons */
        .drawer-auth-section {
          margin-bottom: 1.5rem;
          padding: 1rem 0;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
        }

        .btn-drawer {
          font-weight: 700;
          padding: 1rem;
          border-radius: 14px;
          transition: all 0.3s ease;
          border: 2px solid #2d3748;
          background: transparent;
          color: #2d3748;
        }

        .btn-drawer:hover {
          background: #2d3748;
          color: white;
          transform: translateY(-2px);
        }

        .btn-drawer-primary {
          font-weight: 700;
          padding: 1rem;
          border-radius: 14px;
          background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
          border: none;
          color: white;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
        }

        .btn-drawer-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 193, 7, 0.4);
        }

        /* Enhanced Drawer Footer */
        .drawer-footer {
          padding: 1.5rem 0;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
        }

        .social-link {
          width: 44px;
          height: 44px;
          background: rgba(255, 193, 7, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4a5568;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background: rgba(255, 193, 7, 0.2);
          color: #1a202c;
          transform: translateY(-2px);
        }
      `}</style>
    </>
  );
}

export default Guestnavbar;