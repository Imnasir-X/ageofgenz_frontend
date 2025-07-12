import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Helmet>
        <title>Privacy Policy - The Age Of GenZ | Data Protection & Privacy Rights</title>
        <meta name="description" content="The Age Of GenZ Privacy Policy. Learn how we protect your personal data, respect your privacy rights, and comply with international data protection laws." />
        <meta name="keywords" content="privacy policy, data protection, GDPR compliance, The Age Of GenZ privacy, news organization privacy" />
      </Helmet>

      <div className="container mx-auto px-4 max-w-5xl">
        <section className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Your privacy is fundamental to our mission of trustworthy journalism
          </p>
          <p className="text-gray-500 text-base">
            <strong>Last Updated:</strong> January 15, 2025 | <strong>Effective Date:</strong> January 15, 2025
          </p>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded mt-4"></div>
        </section>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Introduction */}
          <section className="p-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              1. Introduction
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-lg leading-relaxed mb-4">
                At <strong>The Age Of GenZ LLC</strong>, we are committed to protecting your privacy and personal data. 
                As a professional news organization, we understand the critical importance of data protection in maintaining 
                the trust that is essential to journalism.
              </p>
              <p className="leading-relaxed">
                This Privacy Policy explains how we collect, use, process, and protect your personal information when you 
                visit our website <strong>theageofgenz.com</strong>, subscribe to our services, or interact with our content. 
                We comply with applicable data protection laws, including the General Data Protection Regulation (GDPR) 
                and other international privacy standards.
              </p>
            </div>
          </section>

          {/* Data Controller Information */}
          <section className="p-8 bg-gray-50 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              2. Data Controller Information
            </h2>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Legal Entity</h4>
                  <p className="text-gray-700">The Age Of GenZ LLC</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Registration</h4>
                  <p className="text-gray-700">Bangladesh Limited Liability Company</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Address</h4>
                  <p className="text-gray-700">
                    71 No. Councilor Street<br/>
                    Dhaka, Bangladesh
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
                  <p className="text-gray-700">
                    Email: <a href="mailto:contact@theageofgenz.com" className="text-orange-500 hover:text-orange-600">contact@theageofgenz.com</a><br/>
                    Privacy Officer: <a href="mailto:contact@theageofgenz.com" className="text-orange-500 hover:text-orange-600">contact@theageofgenz.com</a>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Information We Collect */}
          <section className="p-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              3. Information We Collect
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">3.1 Information You Provide Directly</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Account Information:</strong> Name, email address, password when you register for an account</li>
                  <li><strong>Newsletter Subscriptions:</strong> Email address and preferences for our newsletter</li>
                  <li><strong>Contact Forms:</strong> Name, email, message content when you contact us</li>
                  <li><strong>Comments and Interactions:</strong> Content you post in comments or social interactions</li>
                  <li><strong>Survey Responses:</strong> Feedback and opinions when you participate in surveys</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">3.2 Information Collected Automatically</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Usage Data:</strong> Pages visited, time spent, click patterns, referral sources</li>
                  <li><strong>Technical Information:</strong> IP address, browser type, device information, operating system</li>
                  <li><strong>Cookies and Tracking:</strong> Session data, preferences, authentication tokens</li>
                  <li><strong>Analytics Data:</strong> Aggregated and anonymized usage statistics</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">3.3 Information from Third Parties</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Social Media:</strong> Public profile information when you share our content</li>
                  <li><strong>Analytics Services:</strong> Aggregated data from Google Analytics and similar services</li>
                  <li><strong>Advertising Partners:</strong> Demographics and interest data for relevant content delivery</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="p-8 bg-gray-50 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              4. How We Use Your Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">🎯 Content Delivery</h4>
                  <p className="text-gray-700 text-sm">Providing personalized news content and recommendations based on your interests</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">📧 Communications</h4>
                  <p className="text-gray-700 text-sm">Sending newsletters, updates, and responding to your inquiries</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">🔧 Service Improvement</h4>
                  <p className="text-gray-700 text-sm">Analyzing usage patterns to enhance website functionality and user experience</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">🛡️ Security</h4>
                  <p className="text-gray-700 text-sm">Protecting against fraud, spam, and maintaining platform security</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">📊 Analytics</h4>
                  <p className="text-gray-700 text-sm">Understanding reader preferences and content performance</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">⚖️ Legal Compliance</h4>
                  <p className="text-gray-700 text-sm">Meeting legal obligations and responding to legitimate requests</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">💰 Business Operations</h4>
                  <p className="text-gray-700 text-sm">Supporting our advertising and subscription revenue models</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">🤝 Community Building</h4>
                  <p className="text-gray-700 text-sm">Facilitating user engagement and community interactions</p>
                </div>
              </div>
            </div>
          </section>

          {/* Legal Basis for Processing */}
          <section className="p-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              5. Legal Basis for Processing (GDPR)
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Consent</h4>
                <p className="text-blue-800 text-sm">Newsletter subscriptions, cookies, and marketing communications</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Legitimate Interest</h4>
                <p className="text-green-800 text-sm">Website analytics, content improvement, and security measures</p>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Contract Performance</h4>
                <p className="text-yellow-800 text-sm">Account management and subscription services</p>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">Legal Obligation</h4>
                <p className="text-red-800 text-sm">Compliance with laws and regulatory requirements</p>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section className="p-8 bg-gray-50 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              6. Information Sharing and Disclosure
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-lg font-semibold text-gray-900 mb-4">We do not sell your personal data. We may share information in these circumstances:</p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-3 mr-4"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Service Providers</h4>
                    <p className="text-gray-700">Third-party services that help us operate (hosting, analytics, email delivery)</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-3 mr-4"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Legal Requirements</h4>
                    <p className="text-gray-700">When required by law, court order, or to protect our rights and safety</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-3 mr-4"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Business Transfers</h4>
                    <p className="text-gray-700">In connection with mergers, acquisitions, or asset sales (with notice)</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-3 mr-4"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Aggregated Data</h4>
                    <p className="text-gray-700">Anonymous, aggregated information for research and business purposes</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="p-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              7. Your Privacy Rights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">🔍 Right to Access</h4>
                  <p className="text-gray-700 text-sm">Request copies of your personal data</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">✏️ Right to Rectification</h4>
                  <p className="text-gray-700 text-sm">Correct inaccurate or incomplete data</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">🗑️ Right to Erasure</h4>
                  <p className="text-gray-700 text-sm">Request deletion of your personal data</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">⛔ Right to Object</h4>
                  <p className="text-gray-700 text-sm">Object to processing for specific purposes</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">⏸️ Right to Restrict</h4>
                  <p className="text-gray-700 text-sm">Limit how we process your data</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">📦 Data Portability</h4>
                  <p className="text-gray-700 text-sm">Receive your data in a portable format</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">❌ Withdraw Consent</h4>
                  <p className="text-gray-700 text-sm">Withdraw consent for processing</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">📋 Lodge Complaints</h4>
                  <p className="text-gray-700 text-sm">File complaints with supervisory authorities</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">How to Exercise Your Rights</h4>
              <p className="text-orange-800 text-sm">
                Contact us at <a href="mailto:contact@theageofgenz.com" className="underline">contact@theageofgenz.com</a> 
                with your request. We will respond within 30 days and may require identity verification.
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section className="p-8 bg-gray-50 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              8. Data Security and Retention
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Security Measures</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl">🔒</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Encryption</h4>
                    <p className="text-sm text-gray-600">SSL/TLS encryption for data transmission</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                    <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl">🛡️</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Access Controls</h4>
                    <p className="text-sm text-gray-600">Limited access to authorized personnel</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl">🔄</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Regular Backups</h4>
                    <p className="text-sm text-gray-600">Secure data backup and recovery</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Data Retention</h3>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Account Data:</strong> Retained while your account is active, plus 3 years after closure</li>
                    <li><strong>Newsletter Subscriptions:</strong> Until you unsubscribe or request deletion</li>
                    <li><strong>Analytics Data:</strong> Aggregated data retained for 5 years for business analysis</li>
                    <li><strong>Legal Requirements:</strong> Some data may be retained longer for legal compliance</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* International Transfers */}
          <section className="p-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              9. International Data Transfers
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="mb-4">
                As we serve a global audience across the United States, Europe, and Asia, your personal data may be 
                transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Standard Contractual Clauses (SCCs) for transfers outside the EEA</li>
                <li>Adequacy decisions where applicable</li>
                <li>Binding Corporate Rules for group companies</li>
                <li>Explicit consent for transfers where required</li>
              </ul>
            </div>
          </section>

          {/* Contact and Updates */}
          <section className="p-8 bg-gray-50">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              10. Contact Us & Policy Updates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Questions or Concerns?</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Privacy Officer</p>
                    <p className="font-medium text-gray-900">
                      <a href="mailto:contact@theageofgenz.com" className="text-orange-500 hover:text-orange-600">
                        contact@theageofgenz.com
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mailing Address</p>
                    <p className="font-medium text-gray-900">
                      The Age Of GenZ LLC<br/>
                      71 No. Councilor Street<br/>
                      Dhaka, Bangladesh
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Policy Updates</h3>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <p className="mb-3">
                    We may update this Privacy Policy to reflect changes in our practices or legal requirements. 
                    We will notify you of significant changes through:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Email notification to subscribers</li>
                    <li>Prominent notice on our website</li>
                    <li>Social media announcements</li>
                  </ul>
                  <p className="mt-3 text-sm">
                    Continued use of our services after changes constitutes acceptance of the updated policy.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/" className="text-orange-500 hover:text-orange-600 transition-colors">
              ← Return to Home
            </Link>
            <Link to="/terms" className="text-gray-600 hover:text-orange-600 transition-colors">
              Terms of Service
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-orange-600 transition-colors">
              Contact Us
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-orange-600 transition-colors">
              About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;