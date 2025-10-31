import React from 'react';

function Footer() {
  return (
    <>
      <footer className="bg-dark text-white pt-5 pb-3">
        <div className="container">
          <div className="row">
            {/* Company Info */}
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="footer-brand mb-3">
                <h4 className="fw-bold">
                  <span className="text-white">Timi</span>
                  <span className="text-warning">pay</span>
                </h4>
              </div>
              <p className="text-light mb-3">
                Secure, fast, and reliable payment solutions for everyone. 
                Experience the future of digital transactions with Timipay.
              </p>
              <div className="social-links">
                <a href="#" className="text-warning me-3">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="#" className="text-warning me-3">
                  <i className="bi bi-twitter"></i>
                </a>
                <a href="#" className="text-warning me-3">
                  <i className="bi bi-linkedin"></i>
                </a>
                <a href="#" className="text-warning me-3">
                  <i className="bi bi-instagram"></i>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-lg-2 col-md-6 mb-4">
              <h5 className="text-warning mb-3">Quick Links</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <a href="#" className="text-light text-decoration-none footer-link">
                    Home
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-light text-decoration-none footer-link">
                    About Us
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-light text-decoration-none footer-link">
                    How it Works
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-light text-decoration-none footer-link">
                    Features
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-light text-decoration-none footer-link">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="col-lg-2 col-md-6 mb-4">
              <h5 className="text-warning mb-3">Support</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <a href="#" className="text-light text-decoration-none footer-link">
                    Help Center
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-light text-decoration-none footer-link">
                    FAQs
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-light text-decoration-none footer-link">
                    Privacy Policy
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-light text-decoration-none footer-link">
                    Terms of Service
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-light text-decoration-none footer-link">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="col-lg-4 col-md-6 mb-4">
              <h5 className="text-warning mb-3">Contact Us</h5>
              <ul className="list-unstyled text-light">
                <li className="mb-3 d-flex align-items-start">
                  <i className="bi bi-geo-alt text-warning me-2 mt-1"></i>
                  <span>123 Payment Street,<br />Digital City, DC 10001</span>
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <i className="bi bi-envelope text-warning me-2"></i>
                  <span>support@timipay.com</span>
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <i className="bi bi-telephone text-warning me-2"></i>
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <i className="bi bi-clock text-warning me-2"></i>
                  <span>24/7 Customer Support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div className="row mt-4 pt-4 border-top border-secondary">
            <div className="col-lg-6 mb-3">
              <h6 className="text-warning mb-2">Stay Updated</h6>
              <p className="text-light small mb-3">
                Subscribe to our newsletter for the latest updates and features.
              </p>
            </div>
            <div className="col-lg-6 mb-3">
              <div className="input-group">
                <input 
                  type="email" 
                  className="form-control bg-light border-0" 
                  placeholder="Enter your email"
                  aria-label="Email"
                />
                <button className="btn btn-warning text-white px-4" type="button">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="row mt-4 pt-3 border-top border-secondary">
            <div className="col-md-6 text-center text-md-start">
              <p className="text-light small mb-0">
                &copy; {new Date().getFullYear()} Timipay. All rights reserved.
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <p className="text-light small mb-0">
                Secure payments with <span className="text-warning">❤</span> by Timipay
              </p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .footer-link {
          transition: all 0.3s ease;
          position: relative;
          padding-left: 0;
        }

        .footer-link:hover {
          color: #ffc107 !important;
          padding-left: 5px;
          text-decoration: none !important;
        }

        .footer-link::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 2px;
          background: #ffc107;
          transition: width 0.3s ease;
        }

        .footer-link:hover::before {
          width: 8px;
        }

        .social-links a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 193, 7, 0.1);
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .social-links a:hover {
          background: #ffc107;
          color: #000 !important;
          transform: translateY(-2px);
        }

        .social-links i {
          font-size: 1.2rem;
        }

        /* Custom form styling */
        .form-control:focus {
          border-color: #ffc107;
          box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.25);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .footer-brand {
            text-align: center;
          }
          
          .social-links {
            text-align: center;
          }
          
          .input-group {
            flex-direction: column;
          }
          
          .input-group .form-control {
            margin-bottom: 10px;
            border-radius: 0.375rem !important;
          }
          
          .input-group .btn {
            border-radius: 0.375rem !important;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}

export default Footer;