import type React from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/seo/Seo';

const Privacy: React.FC = () => {
  return (
    <div className="pb-10 pt-10">
      <Seo title="Privacy Policy" description="How The Age of GenZ collects, uses and protects your personal data, and your privacy rights." path="/privacy/" />

      <div className="container mx-auto px-4 max-w-5xl">
        <section className="mb-8 text-center">
          <h1 className="font-display text-5xl font-medium tracking-[-0.025em] text-foreground md:text-6xl mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Your privacy is fundamental to our mission of trustworthy journalism
          </p>
          <p className="text-muted-foreground text-base">
            <strong>Last Updated:</strong> January 15, 2025 | <strong>Effective Date:</strong> January 15, 2025
          </p>
          <div className="w-24 h-1 bg-primary mx-auto rounded mt-4"></div>
        </section>

        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {/* Introduction */}
          <section className="p-8 border-b border-border">
            <h2 className="text-2xl font-medium mb-4 text-foreground border-b-2 border-primary pb-2 inline-block">
              1. Introduction
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/80">
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
          <section className="p-8 bg-muted/40 border-b border-border">
            <h2 className="text-2xl font-medium mb-4 text-foreground border-b-2 border-primary pb-2 inline-block">
              2. Data Controller Information
            </h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Legal Entity</h4>
                  <p className="text-foreground/80">The Age Of GenZ LLC</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Registration</h4>
                  <p className="text-foreground/80">Bangladesh Limited Liability Company</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Address</h4>
                  <p className="text-foreground/80">
                    71 No. Councilor Street<br/>
                    Dhaka, Bangladesh
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Contact</h4>
                  <p className="text-foreground/80">
                    Email: <a href="mailto:contact@theageofgenz.com" className="text-primary hover:text-primary">contact@theageofgenz.com</a><br/>
                    Privacy Officer: <a href="mailto:contact@theageofgenz.com" className="text-primary hover:text-primary">contact@theageofgenz.com</a>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Information We Collect */}
          <section className="p-8 border-b border-border">
            <h2 className="text-2xl font-medium mb-4 text-foreground border-b-2 border-primary pb-2 inline-block">
              3. Information We Collect
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">3.1 Information You Provide Directly</h3>
                <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                  <li><strong>Account Information:</strong> Name, email address, password when you register for an account</li>
                  <li><strong>Newsletter Subscriptions:</strong> Email address and preferences for our newsletter</li>
                  <li><strong>Contact Forms:</strong> Name, email, message content when you contact us</li>
                  <li><strong>Comments and Interactions:</strong> Content you post in comments or social interactions</li>
                  <li><strong>Survey Responses:</strong> Feedback and opinions when you participate in surveys</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">3.2 Information Collected Automatically</h3>
                <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                  <li><strong>Usage Data:</strong> Pages visited, time spent, click patterns, referral sources</li>
                  <li><strong>Technical Information:</strong> IP address, browser type, device information, operating system</li>
                  <li><strong>Cookies and Tracking:</strong> Session data, preferences, authentication tokens</li>
                  <li><strong>Analytics Data:</strong> Aggregated and anonymized usage statistics</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">3.3 Information from Third Parties</h3>
                <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                  <li><strong>Social Media:</strong> Public profile information when you share our content</li>
                  <li><strong>Analytics Services:</strong> Aggregated data from Google Analytics and similar services</li>
                  <li><strong>Advertising Partners:</strong> Demographics and interest data for relevant content delivery</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="p-8 bg-muted/40 border-b border-border">
            <h2 className="text-2xl font-medium mb-4 text-foreground border-b-2 border-primary pb-2 inline-block">
              4. How We Use Your Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Content Delivery</h4>
                  <p className="text-foreground/80 text-sm">Providing personalized news content and recommendations based on your interests</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Communications</h4>
                  <p className="text-foreground/80 text-sm">Sending newsletters, updates, and responding to your inquiries</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Service Improvement</h4>
                  <p className="text-foreground/80 text-sm">Analyzing usage patterns to enhance website functionality and user experience</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Security</h4>
                  <p className="text-foreground/80 text-sm">Protecting against fraud, spam, and maintaining platform security</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Analytics</h4>
                  <p className="text-foreground/80 text-sm">Understanding reader preferences and content performance</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Legal Compliance</h4>
                  <p className="text-foreground/80 text-sm">Meeting legal obligations and responding to legitimate requests</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Business Operations</h4>
                  <p className="text-foreground/80 text-sm">Supporting our advertising and subscription revenue models</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Community Building</h4>
                  <p className="text-foreground/80 text-sm">Facilitating user engagement and community interactions</p>
                </div>
              </div>
            </div>
          </section>

          {/* Legal Basis for Processing */}
          <section className="p-8 border-b border-border">
            <h2 className="text-2xl font-medium mb-4 text-foreground border-b-2 border-primary pb-2 inline-block">
              5. Legal Basis for Processing (GDPR)
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-mist border border-primary rounded-lg">
                <h4 className="font-semibold text-primary mb-2">Consent</h4>
                <p className="text-primary text-sm">Newsletter subscriptions, cookies, and marketing communications</p>
              </div>
              <div className="p-4 bg-mist border border-primary/30 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">Legitimate Interest</h4>
                <p className="text-primary text-sm">Website analytics, content improvement, and security measures</p>
              </div>
              <div className="p-4 bg-muted border border-border rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Contract Performance</h4>
                <p className="text-foreground text-sm">Account management and subscription services</p>
              </div>
              <div className="p-4 bg-muted border border-destructive/40 rounded-lg">
                <h4 className="font-semibold text-destructive mb-2">Legal Obligation</h4>
                <p className="text-destructive text-sm">Compliance with laws and regulatory requirements</p>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section className="p-8 bg-muted/40 border-b border-border">
            <h2 className="text-2xl font-medium mb-4 text-foreground border-b-2 border-primary pb-2 inline-block">
              6. Information Sharing and Disclosure
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/80">
              <p className="text-lg font-semibold text-foreground mb-4">We do not sell your personal data. We may share information in these circumstances:</p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-3 mr-4"></div>
                  <div>
                    <h4 className="font-semibold text-foreground">Service Providers</h4>
                    <p className="text-foreground/80">Third-party services that help us operate (hosting, analytics, email delivery)</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-3 mr-4"></div>
                  <div>
                    <h4 className="font-semibold text-foreground">Legal Requirements</h4>
                    <p className="text-foreground/80">When required by law, court order, or to protect our rights and safety</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-3 mr-4"></div>
                  <div>
                    <h4 className="font-semibold text-foreground">Business Transfers</h4>
                    <p className="text-foreground/80">In connection with mergers, acquisitions, or asset sales (with notice)</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-3 mr-4"></div>
                  <div>
                    <h4 className="font-semibold text-foreground">Aggregated Data</h4>
                    <p className="text-foreground/80">Anonymous, aggregated information for research and business purposes</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="p-8 border-b border-border">
            <h2 className="text-2xl font-medium mb-4 text-foreground border-b-2 border-primary pb-2 inline-block">
              7. Your Privacy Rights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Right to Access</h4>
                  <p className="text-foreground/80 text-sm">Request copies of your personal data</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Right to Rectification</h4>
                  <p className="text-foreground/80 text-sm">Correct inaccurate or incomplete data</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Right to Erasure</h4>
                  <p className="text-foreground/80 text-sm">Request deletion of your personal data</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Right to Object</h4>
                  <p className="text-foreground/80 text-sm">Object to processing for specific purposes</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Right to Restrict Processing</h4>
                  <p className="text-foreground/80 text-sm">Limit how we process your data</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Right to Data Portability</h4>
                  <p className="text-foreground/80 text-sm">Receive your data in a portable format</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Right to Withdraw Consent</h4>
                  <p className="text-foreground/80 text-sm">Withdraw consent for processing</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Right to Lodge Complaints</h4>
                  <p className="text-foreground/80 text-sm">File complaints with supervisory authorities</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-primary border border-primary rounded-lg">
              <h4 className="font-semibold text-primary mb-2">How to Exercise Your Rights</h4>
              <p className="text-primary text-sm">
                Contact us at <a href="mailto:contact@theageofgenz.com" className="underline">contact@theageofgenz.com</a> 
                with your request. We will respond within 30 days and may require identity verification.
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section className="p-8 bg-muted/40 border-b border-border">
            <h2 className="text-2xl font-medium mb-4 text-foreground border-b-2 border-primary pb-2 inline-block">
              8. Data Security and Retention
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Security Measures</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-card rounded-lg border border-border">
                    <div className="w-12 h-12 bg-mist rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl">🔒</span>
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">Encryption</h4>
                    <p className="text-sm text-muted-foreground">SSL/TLS encryption for data transmission</p>
                  </div>
                  <div className="text-center p-4 bg-card rounded-lg border border-border">
                    <div className="w-12 h-12 bg-mist rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl">🛡️</span>
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">Access Controls</h4>
                    <p className="text-sm text-muted-foreground">Limited access to authorized personnel</p>
                  </div>
                  <div className="text-center p-4 bg-card rounded-lg border border-border">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl">🔄</span>
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">Regular Backups</h4>
                    <p className="text-sm text-muted-foreground">Secure data backup and recovery</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Data Retention</h3>
                <div className="prose prose-sm max-w-none text-foreground/80">
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
          <section className="p-8 border-b border-border">
            <h2 className="text-2xl font-medium mb-4 text-foreground border-b-2 border-primary pb-2 inline-block">
              9. International Data Transfers
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/80">
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
          <section className="p-8 bg-muted/40">
            <h2 className="text-2xl font-medium mb-4 text-foreground border-b-2 border-primary pb-2 inline-block">
              10. Contact Us & Policy Updates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Questions or Concerns?</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Privacy Officer</p>
                    <p className="font-medium text-foreground">
                      <a href="mailto:contact@theageofgenz.com" className="text-primary hover:text-primary">
                        contact@theageofgenz.com
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mailing Address</p>
                    <p className="font-medium text-foreground">
                      The Age Of GenZ LLC<br/>
                      71 No. Councilor Street<br/>
                      Dhaka, Bangladesh
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Policy Updates</h3>
                <div className="prose prose-sm max-w-none text-foreground/80">
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
            <Link to="/" className="text-primary hover:text-primary transition-colors">
              &larr; Return to Home
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
              Contact Us
            </Link>
            <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
              About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;