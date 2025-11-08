import React, { useState } from 'react'
import { Sidebar as ProSidebar, Menu, MenuItem } from 'react-pro-sidebar'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

function Usernavbar({ user, children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const name = user?.user_metadata?.name || user?.user_metadata?.full_name || 'User'
  const email = user?.email || ''

  const logout = async () => {
    try {
      // Clear all persistent session data (localStorage and cookies)
      const { sessionStorage } = await import('../../lib/supabaseClient');
      await sessionStorage.clear();
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback: try to sign out anyway
      try {
        await supabase.auth.signOut();
      } catch (_) {}
    }
    window.location.href = '/'
  }

  // Helper function to check if route is active
  const isActive = (path) => location.pathname === path

  // Handle navigation
  const handleNavigate = (path) => {
    navigate(path)
  }

  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh', backgroundColor: '#fafbfc' }}>
      {/* Top Navbar - Light & Clean */}
      <nav 
        className="navbar navbar-expand-lg"
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e8eaed',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          zIndex: 1000
        }}
      >
        <div className="container-fluid px-4">
          {/* Logo/Brand */}
          <a className="navbar-brand d-flex align-items-center" href="/" style={{ color: '#1f1f1f' }}>
            <img 
              src="/logotimi.png" 
              alt="Timipay Logo" 
              style={{ height: '40px', width: 'auto', cursor: 'pointer' }}
            />
          </a>

          {/* Search Bar */}
          <div className="mx-auto" style={{ maxWidth: '480px', width: '100%' }}>
            <div className="input-group">
              <span 
                className="input-group-text border-0" 
                style={{ 
                  backgroundColor: '#f5f5f5',
                  color: '#666'
                }}
              >
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-0 shadow-none"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#1f1f1f'
                }}
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="d-flex align-items-center gap-2">
            {/* Notifications */}
            <div className="position-relative">
              <button
                className="btn btn-link position-relative p-2"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                style={{ color: '#5f6368', fontSize: '1.2rem' }}
              >
                <i className="bi bi-bell"></i>
                <span 
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                  style={{ backgroundColor: '#ffb300', color: '#fff', fontSize: '0.6rem', padding: '3px 5px' }}
                >
                  3
                </span>
              </button>
              
              {notificationsOpen && (
                <div 
                  className="position-absolute end-0 mt-2"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e8eaed',
                    borderRadius: '12px',
                    width: '320px',
                    zIndex: 1001,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
                  }}
                >
                  <div className="p-3 border-bottom" style={{ borderColor: '#e8eaed !important' }}>
                    <h6 className="mb-0 fw-semibold" style={{ color: '#1f1f1f' }}>Notifications</h6>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-3 border-bottom" style={{ borderColor: '#f5f5f5 !important', cursor: 'pointer' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div className="d-flex gap-2">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{ 
                              width: 32, 
                              height: 32,
                              backgroundColor: '#fff3e0',
                              color: '#ffb300',
                              flexShrink: 0,
                              fontSize: '0.9rem'
                            }}
                          >
                            <i className="bi bi-info-circle-fill"></i>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="small fw-medium" style={{ color: '#1f1f1f' }}>New update available</div>
                            <div className="small" style={{ color: '#5f6368' }}>2 hours ago</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 text-center border-top" style={{ borderColor: '#e8eaed !important' }}>
                    <a href="#" className="small text-decoration-none" style={{ color: '#ffb300' }}>View all notifications</a>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <button className="btn btn-link p-2" style={{ color: '#5f6368', fontSize: '1.2rem' }}>
              <i className="bi bi-chat-dots"></i>
            </button>

          {/* User Avatar with dropdown */}
          <div className="position-relative ms-2">
            <button
              className="rounded-circle d-flex align-items-center justify-content-center"
              onClick={() => setNotificationsOpen(false)}
              onMouseDown={(e) => e.preventDefault()}
              onClickCapture={() => {
                const el = document.getElementById('tp-avatar-dropdown');
                if (el) el.style.display = el.style.display === 'block' ? 'none' : 'block';
              }}
              style={{ 
                width: 36, 
                height: 36,
                background: 'linear-gradient(135deg, #ffd54f 0%, #ffb300 100%)',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 2px 8px rgba(255, 193, 7, 0.2)'
              }}
            >
              {name?.[0]?.toUpperCase() || 'U'}
            </button>
            <div id="tp-avatar-dropdown" className="card shadow-sm position-absolute end-0 mt-2" style={{ width: 260, display: 'none', zIndex: 1100 }}>
              <div className="card-body p-2">
                <div className="d-flex align-items-center gap-2 p-2">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ 
                      width: 36, 
                      height: 36,
                      background: 'linear-gradient(135deg, #ffd54f 0%, #ffb300 100%)',
                      color: '#fff',
                      fontWeight: '600'
                    }}
                  >
                    {name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="fw-semibold small">{name}</div>
                    <div className="text-muted small">{email}</div>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <button className="btn btn-sm btn-outline-dark w-100" onClick={logout}>Logout</button>
              </div>
            </div>
          </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area with Sidebar */}
      <div className="d-flex flex-grow-1">
        <ProSidebar
          collapsed={collapsed}
          backgroundColor="#ffffff"
          width="260px"
          collapsedWidth="70px"
          style={{
            borderRight: '1px solid #e8eaed',
            boxShadow: '1px 0 3px rgba(0,0,0,0.02)',
            height: 'calc(100vh - 65px)'
          }}
        >
          {/* Toggle Button */}
          <div className="d-flex justify-content-end p-2">
            <button
              className="btn btn-sm"
              onClick={() => setCollapsed(!collapsed)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#5f6368',
                fontSize: '1.1rem'
              }}
            >
              <i className={`bi bi-${collapsed ? 'chevron-right' : 'chevron-left'}`}></i>
            </button>
          </div>

          {/* Sidebar header with company name */}
          {!collapsed && (
            <div className="px-3 py-3 border-bottom" style={{ borderColor: '#e8eaed' }}>
              <div className="fw-bold" style={{ color: '#1f1f1f' }}>Timipay</div>
            </div>
          )}

          {/* Navigation Menu */}
          <Menu
            menuItemStyles={{
              button: ({ active }) => ({
                backgroundColor: active ? '#fff9e6' : 'transparent',
                color: active ? '#1f1f1f' : '#5f6368',
                borderLeft: active ? '3px solid #ffb300' : '3px solid transparent',
                padding: '11px 18px',
                transition: 'all 0.2s ease',
                fontWeight: active ? '500' : '400',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#f8f9fa',
                  color: '#1f1f1f'
                }
              })
            }}
          >
            <MenuItem 
              active={isActive('/dashboard')}
              onClick={() => handleNavigate('/dashboard')}
              icon={<i className="bi bi-grid" style={{ fontSize: '1.1rem' }}></i>}
            >
              <span style={{ fontSize: '0.9rem' }}>Dashboard</span>
            </MenuItem>
            
            <MenuItem 
              active={isActive('/videos-user')}
              onClick={() => handleNavigate('/videos-user')}
              icon={<i className="bi bi-camera-video" style={{ fontSize: '1.1rem' }}></i>}
            >
              <span style={{ fontSize: '0.9rem' }}>Videos</span>
            </MenuItem>
            
            <MenuItem 
              active={isActive('/calendar')}
              onClick={() => handleNavigate('/calendar')}
              icon={<i className="bi bi-calendar3" style={{ fontSize: '1.1rem' }}></i>}
            >
              <span style={{ fontSize: '0.9rem' }}>Calendar</span>
            </MenuItem>
            
            <MenuItem 
              active={isActive('/e-commerce')}
              onClick={() => handleNavigate('/e-commerce')}
              icon={<i className="bi bi-bag" style={{ fontSize: '1.1rem' }}></i>}
            >
              <span style={{ fontSize: '0.9rem' }}>E-commerce</span>
            </MenuItem>

            <div style={{ margin: '16px 0', borderTop: '1px solid #f0f0f0' }}></div>

            <MenuItem 
              active={isActive('/settings')}
              onClick={() => handleNavigate('/settings')}
              icon={<i className="bi bi-gear" style={{ fontSize: '1.1rem' }}></i>}
            >
              <span style={{ fontSize: '0.9rem' }}>Settings</span>
            </MenuItem>
            
            <MenuItem 
              active={isActive('/help')}
              onClick={() => handleNavigate('/help')}
              icon={<i className="bi bi-question-circle" style={{ fontSize: '1.1rem' }}></i>}
            >
              <span style={{ fontSize: '0.9rem' }}>Help & Support</span>
            </MenuItem>
          </Menu>

          {/* Footer */}
          {!collapsed && (
            <div 
              className="mt-auto p-3 text-center" 
              style={{ 
                borderTop: '1px solid #f0f0f0',
                color: '#9aa0a6',
                fontSize: '0.7rem'
              }}
            >
              © 2025 YourApp
            </div>
          )}
        </ProSidebar>
        
        {/* Main Content Area - Renders children from routes */}
        <div className="flex-grow-1" style={{ backgroundColor: '#fafbfc', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Usernavbar