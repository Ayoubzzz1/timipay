import React from 'react'

function Popterms({ open, onClose, onAccept }) {
  if (!open) return null
  return (
    <div className="position-fixed top-0 start-0 w-100 h-100" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="position-absolute top-50 start-50 translate-middle" style={{ width: 'min(900px, 95vw)' }}>
        <div className="card border-0 shadow-lg">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Terms & Conditions and Privacy Policy</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="card-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <h6>TIMIPAYS TERMS AND CONDITIONS</h6>
            
            <h6 className="mt-4">TERMS OF SERVICE</h6>
            
            <p><strong>1. Introduction</strong><br/>
            Welcome to Timipays! These Terms of Service ("Terms") govern your use of our platform and services. By accessing or using Timipays, you agree to be bound by these Terms. If you disagree with any part of these Terms, you must not use our services.</p>
            
            <p><strong>2. Eligibility</strong><br/>
            You must be at least 18 years old and have the legal capacity to enter into a binding contract to use Timipays. By using our services, you represent and warrant that you meet these eligibility requirements.</p>
            
            <p><strong>3. Account Registration</strong><br/>
            To use our services, you must create an account by providing accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
            
            <p><strong>Important Notice</strong><br/>
            Timipays reserves the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activities. All earnings are subject to verification and compliance with our policies.</p>
            
            <p><strong>4. Earning Structure</strong><br/>
            Timipays operates on a performance-based earning model where users earn money through:</p>
            <ul>
              <li><strong>Screen Time:</strong> Watching content and engaging with partner brands</li>
              <li><strong>Tasks:</strong> Completing verified High-Value Tasks (HVT)</li>
              <li><strong>Referrals:</strong> Inviting new users who complete their first task</li>
            </ul>
            
            <p><strong>5. Payout Terms</strong><br/>
            Payouts are processed through PayPal and are subject to the following conditions:</p>
            <ul>
              <li>Minimum payout threshold of $100</li>
              <li>Completion of 120 hours of screen time</li>
              <li>Completion of 26 verified HVT tasks</li>
              <li>Referral of 10 active users</li>
              <li>All activities must comply with our Anti-Fraud Policy</li>
            </ul>
            
            <p><strong>6. Intellectual Property</strong><br/>
            All content, trademarks, and intellectual property on Timipays are owned by Timipays or its licensors. You may not reproduce, distribute, or create derivative works without explicit permission.</p>
            
            <p><strong>7. Limitation of Liability</strong><br/>
            Timipays provides services "as is" and makes no warranties regarding the accuracy, reliability, or availability of our platform. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services.</p>
            
            <p><strong>8. Termination</strong><br/>
            We reserve the right to terminate or suspend your account immediately, without prior notice, for any violation of these Terms or if we suspect fraudulent activity.</p>
            
            <h6 className="mt-4">PRIVACY POLICY</h6>
            
            <p><strong>1. Information We Collect</strong><br/>
            We collect personal information including but not limited to: name, email address, PayPal account details, device information, IP address, and usage data related to your activities on our platform.</p>
            
            <p><strong>2. How We Use Your Information</strong><br/>
            Your information is used to:</p>
            <ul>
              <li>Process payments and payouts</li>
              <li>Verify your identity and prevent fraud</li>
              <li>Track your earning progress and activities</li>
              <li>Improve our services and user experience</li>
              <li>Communicate with you about your account</li>
            </ul>
            
            <p><strong>3. Data Sharing</strong><br/>
            We do not sell your personal information to third parties. We may share data with:</p>
            <ul>
              <li>Payment processors (PayPal) for transaction processing</li>
              <li>Partner brands for content delivery and verification</li>
              <li>Legal authorities when required by law</li>
            </ul>
            
            <p><strong>4. Data Security</strong><br/>
            We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your personal information.</p>
            
            <p><strong>5. Your Rights</strong><br/>
            You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (subject to legal obligations)</li>
              <li>Withdraw consent for data processing</li>
            </ul>
            
            <h6 className="mt-4">GDPR COMPLIANCE</h6>
            
            <p><strong>1. Lawful Basis for Processing</strong><br/>
            We process your personal data based on the following lawful bases under GDPR:</p>
            <ul>
              <li><strong>Contract:</strong> To fulfill our contract with you for providing earning services</li>
              <li><strong>Legal Obligation:</strong> To comply with tax and financial regulations</li>
              <li><strong>Legitimate Interest:</strong> To prevent fraud and ensure platform security</li>
            </ul>
            
            <p><strong>2. Data Protection Officer</strong><br/>
            Our Data Protection Officer can be contacted at: dpo@timipays.com</p>
            
            <p><strong>3. International Data Transfers</strong><br/>
            Your data may be transferred outside the European Economic Area (EEA) to our servers and payment processors. We ensure adequate safeguards are in place including Standard Contractual Clauses.</p>
            
            <p><strong>4. Data Retention</strong><br/>
            We retain your personal data for:</p>
            <ul>
              <li>7 years for financial and tax compliance purposes</li>
              <li>As long as necessary for fraud prevention</li>
              <li>Until you request deletion (where legally permissible)</li>
            </ul>
            
            <h6 className="mt-4">ANTI-FRAUD POLICY</h6>
            
            <p><strong>1. Prohibited Activities</strong><br/>
            The following activities are strictly prohibited and constitute fraud:</p>
            <ul>
              <li>Using bots, scripts, or automated tools to generate fake activity</li>
              <li>Creating multiple accounts to manipulate the system</li>
              <li>Providing false or misleading information during registration</li>
              <li>Engaging in click fraud or impression fraud</li>
              <li>Manipulating referral links or creating fake referrals</li>
            </ul>
            
            <p><strong>Zero Tolerance Policy</strong><br/>
            Timipays maintains a zero-tolerance policy towards fraudulent activities. Any detected fraud will result in immediate account termination and forfeiture of all earnings.</p>
            
            <p><strong>2. Fraud Detection</strong><br/>
            We employ advanced fraud detection systems including:</p>
            <ul>
              <li>Behavioral analysis and anomaly detection</li>
              <li>IP address and device fingerprinting</li>
              <li>Activity pattern monitoring</li>
              <li>Manual review of suspicious activities</li>
            </ul>
            
            <p><strong>3. Consequences of Fraud</strong><br/>
            Consequences for fraudulent activities include:</p>
            <ul>
              <li>Immediate account suspension or termination</li>
              <li>Forfeiture of all accumulated earnings</li>
              <li>Permanent ban from the platform</li>
              <li>Legal action where applicable</li>
            </ul>
            
            <h6 className="mt-4">COOKIE POLICY</h6>
            
            <p><strong>1. What Are Cookies</strong><br/>
            Cookies are small text files stored on your device that help us provide and improve our services.</p>
            
            <p><strong>2. Types of Cookies We Use</strong></p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for basic functionality (session management, security)</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how you use our platform</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Advertising Cookies:</strong> Used for targeted advertising (with your consent)</li>
            </ul>
            
            <p><strong>3. Managing Cookies</strong><br/>
            You can manage your cookie preferences through your browser settings or by using our cookie consent banner when you first visit our site.</p>
            
            <h6 className="mt-4">ADDITIONAL DISCLAIMERS</h6>
            
            <p><strong>1. Earnings Disclaimer</strong><br/>
            While we guarantee the $100 payout upon completion of all requirements, actual earnings may vary based on individual activity levels, market conditions, and availability of partner content.</p>
            
            <p><strong>2. Platform Availability</strong><br/>
            Timipays strives to maintain 99.9% uptime but cannot guarantee uninterrupted service due to maintenance, technical issues, or force majeure events.</p>
            
            <p><strong>3. Third-Party Content</strong><br/>
            Content provided by partner brands is not endorsed by Timipays. We are not responsible for the accuracy, legality, or quality of third-party content.</p>
            
            <p><strong>4. No Financial Advice</strong><br/>
            Timipays does not provide financial, investment, or tax advice. Consult with a qualified professional for advice specific to your situation.</p>
            
            <p className="mt-4"><em>Last Updated: [12 Octobre 2025]</em></p>
            
            <p>By using Timipays, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</p>
          </div>
          <div className="card-footer d-flex justify-content-end gap-2">
            <button className="btn btn-outline-secondary" onClick={onClose}>Close</button>
            <button className="btn btn-warning text-white" onClick={onAccept}>I totally read it</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Popterms
