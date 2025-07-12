import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Helmet>
        <title>Terms of Service - The Age Of GenZ | User Agreement & Legal Terms</title>
        <meta name="description" content="The Age Of GenZ Terms of Service. Legal agreement governing use of our news platform, content policies, and user rights and responsibilities." />
        <meta name="keywords" content="terms of service, user agreement, legal terms, The Age Of GenZ terms, news organization legal" />
      </Helmet>

      <div className="container mx-auto px-4 max-w-5xl">
        <section className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Legal agreement governing your use of The Age Of GenZ platform
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
              1. Agreement and Acceptance
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-lg leading-relaxed mb-4">
                Welcome to <strong>The Age Of GenZ</strong> ("we," "us," "our"), a professional news organization 
                operated by <strong>The Age Of GenZ LLC</strong>, a Bangladesh limited liability company. These Terms of Service 
                ("Terms") govern your access to and use of our website <strong>theageofgenz.com</strong>, mobile applications, 
                newsletters, and related services (collectively, the "Service").
              </p>
              <p className="leading-relaxed">
                By accessing or using our Service, you agree to be bound by these Terms and our Privacy Policy. 
                If you disagree with any part of these terms, you may not access the Service. These Terms apply to 
                all visitors, users, and others who access or use the Service.
              </p>
            </div>
          </section>

          {/* Service Description */}
          <section className="p-8 bg-gray-50 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              2. Description of Service
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                The Age Of GenZ is a professional news and media organization providing journalistic content 
                across multiple categories including world news, politics, culture, technology, sports, opinions, 
                and insights. Our mission is to deliver "NEWS YOU CAN VIBE WITH" to a global audience.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Our Services Include:</h4>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                    <li>Daily news articles and reporting</li>
                    <li>Opinion and analysis pieces</li>
                    <li>Newsletter subscriptions</li>
                    <li>Comment and community features</li>
                    <li>Social media integration</li>
                    <li>Mobile and web applications</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Coverage Areas:</h4>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                    <li>Breaking news and current events</li>
                    <li>Political analysis and reporting</li>
                    <li>Cultural trends and commentary</li>
                    <li>Technology and AI developments</li>
                    <li>Sports coverage and analysis</li>
                    <li>Editorial opinions and insights</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* User Accounts */}
          <section className="p-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              3. User Accounts and Registration
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">3.1 Account Creation</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To access certain features of our Service, you must register for an account. When creating an account, you agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Provide accurate, complete, and current information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security and confidentiality of your password</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized access</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">3.2 Account Responsibilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">✅ You Must</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Use your real identity</li>
                      <li>• Provide valid email address</li>
                      <li>• Secure your login credentials</li>
                      <li>• Follow community guidelines</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">❌ You Must Not</h4>
                    <ul className="text-red-800 text-sm space-y-1">
                      <li>• Create multiple accounts</li>
                      <li>• Share account credentials</li>
                      <li>• Use automated tools</li>
                      <li>• Impersonate others</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Content and Intellectual Property */}
          <section className="p-8 bg-gray-50 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              4. Content and Intellectual Property
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">4.1 Our Content</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  All content published by The Age Of GenZ, including articles, images, videos, graphics, 
                  logos, and design elements, is protected by copyright and other intellectual property laws. 
                  This content is owned by The Age Of GenZ LLC or licensed from third parties.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Permitted Uses</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Personal, non-commercial reading and research</li>
                    <li>• Social media sharing with proper attribution</li>
                    <li>• Brief excerpts for educational or commentary purposes (fair use)</li>
                    <li>• Linking to our articles from other websites</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">4.2 User-Generated Content</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  When you submit comments, feedback, or other content to our Service, you grant us a 
                  worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display 
                  such content in connection with our Service.
                </p>
                
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">Content Standards</h4>
                    <p className="text-yellow-800 text-sm">
                      All user content must be respectful, factual, and comply with applicable laws. 
                      We reserve the right to remove content that violates our community guidelines.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">4.3 DMCA and Copyright Infringement</h3>
                <p className="text-gray-700 leading-relaxed">
                  We respect intellectual property rights and respond to valid DMCA takedown notices. 
                  If you believe your copyrighted work has been infringed, contact us at 
                  <a href="mailto:contact@theageofgenz.com" className="text-orange-500 hover:text-orange-600 ml-1">
                    contact@theageofgenz.com
                  </a>
                  with detailed information about the alleged infringement.
                </p>
              </div>
            </div>
          </section>

          {/* Acceptable Use Policy */}
          <section className="p-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              5. Acceptable Use Policy
            </h2>
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                You agree to use our Service responsibly and in compliance with all applicable laws. 
                The following activities are strictly prohibited:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">🚫 Prohibited Content</h4>
                    <ul className="text-red-800 text-sm space-y-1">
                      <li>• Illegal, harmful, or threatening material</li>
                      <li>• Harassment, hate speech, or discrimination</li>
                      <li>• False information or misinformation</li>
                      <li>• Spam, promotional content, or advertising</li>
                      <li>• Explicit or inappropriate material</li>
                      <li>• Copyright or trademark infringement</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">🚫 Prohibited Activities</h4>
                    <ul className="text-red-800 text-sm space-y-1">
                      <li>• Attempting to gain unauthorized access</li>
                      <li>• Interfering with Service functionality</li>
                      <li>• Using automated scraping or data collection</li>
                      <li>• Impersonating individuals or organizations</li>
                      <li>• Distributing malware or harmful code</li>
                      <li>• Circumventing security measures</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">Enforcement</h4>
                <p className="text-orange-800 text-sm">
                  Violations may result in content removal, account suspension, or termination. 
                  We reserve the right to investigate and take appropriate legal action for serious violations.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy and Data */}
          <section className="p-8 bg-gray-50 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              6. Privacy and Data Protection
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="mb-4">
                Your privacy is important to us. Our collection, use, and protection of your personal information 
                is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Data We Collect</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Account registration information</li>
                    <li>• Usage and analytics data</li>
                    <li>• Comments and user content</li>
                    <li>• Newsletter subscription preferences</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Your Rights</h4>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• Access and update your data</li>
                    <li>• Request data deletion</li>
                    <li>• Opt-out of marketing communications</li>
                    <li>• Data portability and correction</li>
                  </ul>
                </div>
              </div>
              
              <p className="mt-4">
                For detailed information about our privacy practices, please review our 
                <Link to="/privacy" className="text-orange-500 hover:text-orange-600 ml-1">Privacy Policy</Link>.
              </p>
            </div>
          </section>

          {/* Disclaimers and Limitation of Liability */}
          <section className="p-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              7. Disclaimers and Limitation of Liability
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">7.1 Service Disclaimers</h3>
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <p className="text-yellow-900 font-semibold mb-3">IMPORTANT DISCLAIMER:</p>
                  <p className="text-yellow-800 text-sm leading-relaxed">
                    Our Service is provided "as is" and "as available" without warranties of any kind, either express or implied. 
                    While we strive for accuracy in our reporting, we do not guarantee that our content is error-free, 
                    complete, or current. News and information can change rapidly, and we may not be able to update 
                    all content immediately.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">7.2 Editorial Independence</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our editorial content reflects the professional judgment of our journalists and editors. 
                  Opinions expressed in editorials and opinion pieces are those of the authors and do not 
                  necessarily represent the views of The Age Of GenZ LLC, its employees, or affiliates.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">7.3 Limitation of Liability</h3>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <p className="mb-3">
                    To the maximum extent permitted by law, The Age Of GenZ LLC and its affiliates shall not be liable for:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Indirect, incidental, special, consequential, or punitive damages</li>
                    <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
                    <li>Damages resulting from unauthorized access to or alteration of your content</li>
                    <li>Damages arising from reliance on information provided through our Service</li>
                    <li>Interruption or cessation of transmission to or from our Service</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Indemnification */}
          <section className="p-8 bg-gray-50 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              8. Indemnification
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="mb-4">
                You agree to defend, indemnify, and hold harmless The Age Of GenZ LLC, its officers, directors, 
                employees, and agents from and against any claims, damages, obligations, losses, liabilities, 
                costs, or debt, and expenses (including attorney's fees) arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your use of and access to the Service</li>
                <li>Your violation of any term of these Terms</li>
                <li>Your violation of any third-party right, including copyright, property, or privacy rights</li>
                <li>Any claim that your content caused damage to a third party</li>
                <li>Any activity related to your account, whether by you or any third party using your account</li>
              </ul>
            </div>
          </section>

          {/* Termination */}
          <section className="p-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              9. Termination
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">9.1 Termination by You</h3>
                <p className="text-gray-700 leading-relaxed">
                  You may terminate your account at any time by contacting us at 
                  <a href="mailto:contact@theageofgenz.com" className="text-orange-500 hover:text-orange-600 ml-1">
                    contact@theageofgenz.com
                  </a>. 
                  Upon termination, your right to use the Service will cease immediately.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">9.2 Termination by Us</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may terminate or suspend your account and access to the Service immediately, 
                  without prior notice, for conduct that we believe violates these Terms or is harmful 
                  to other users, us, or third parties.
                </p>
                
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">Grounds for Termination</h4>
                  <ul className="text-red-800 text-sm space-y-1">
                    <li>• Violation of these Terms or our policies</li>
                    <li>• Fraudulent or illegal activity</li>
                    <li>• Harassment of other users or staff</li>
                    <li>• Repeated posting of prohibited content</li>
                    <li>• Security breaches or attempted unauthorized access</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">9.3 Effect of Termination</h3>
                <p className="text-gray-700 leading-relaxed">
                  Upon termination, all provisions of these Terms which by their nature should survive 
                  termination shall survive, including ownership provisions, warranty disclaimers, 
                  indemnity, and limitations of liability.
                </p>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <section className="p-8 bg-gray-50 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              10. Governing Law and Dispute Resolution
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">10.1 Governing Law</h3>
                <p className="text-gray-700 leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of Bangladesh, 
                  without regard to its conflict of law provisions. Any legal action or proceeding arising 
                  under these Terms will be brought exclusively in the courts of Dhaka, Bangladesh.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">10.2 Dispute Resolution</h3>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Before pursuing formal legal action, we encourage you to contact us to discuss the matter 
                    and seek a resolution. Many disputes can be resolved quickly and amicably through direct communication.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <span className="text-lg">💬</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">Step 1: Direct Contact</h4>
                      <p className="text-xs text-gray-600 mt-1">Email us with your concern</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-green-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <span className="text-lg">🤝</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">Step 2: Negotiation</h4>
                      <p className="text-xs text-gray-600 mt-1">Work together on a solution</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <span className="text-lg">⚖️</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">Step 3: Legal Action</h4>
                      <p className="text-xs text-gray-600 mt-1">If necessary, pursue formal resolution</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* General Provisions */}
          <section className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              11. General Provisions
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Changes to Terms</h4>
                  <p className="text-gray-700 text-sm">
                    We reserve the right to modify these Terms at any time. We will notify users of 
                    significant changes via email or website notice.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Severability</h4>
                  <p className="text-gray-700 text-sm">
                    If any provision of these Terms is held to be invalid or unenforceable, 
                    the remaining provisions will remain in full force and effect.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Entire Agreement</h4>
                  <p className="text-gray-700 text-sm">
                    These Terms, together with our Privacy Policy, constitute the entire agreement 
                    between you and The Age Of GenZ LLC.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Assignment</h4>
                  <p className="text-gray-700 text-sm">
                    We may assign our rights and obligations under these Terms without restriction. 
                    You may not assign your rights without our written consent.
                  </p>
                </div>
              </div>

              <div className="mt-8 p-6 bg-orange-50 border border-orange-200 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-orange-900">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-orange-800 mb-1"><strong>Legal Inquiries:</strong></p>
                    <p className="text-orange-700">
                      <a href="mailto:contact@theageofgenz.com" className="hover:underline">
                        contact@theageofgenz.com
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-orange-800 mb-1"><strong>Mailing Address:</strong></p>
                    <p className="text-orange-700 text-sm">
                      The Age Of GenZ LLC<br/>
                      71 No. Councilor Street<br/>
                      Dhaka, Bangladesh
                    </p>
                  </div>
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
            <Link to="/privacy" className="text-gray-600 hover:text-orange-600 transition-colors">
              Privacy Policy
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

export default Terms;