import type React from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/seo/Seo';
import { EnglishOnlyNote } from '@/components/layout/PageShell';
import { FileText, ShieldCheck, Gavel, Scale, HelpCircle, ExternalLink, ArrowUpRight, MessageCircle, Users, CircleCheck, CircleX, Ban } from 'lucide-react';

const sectionNav = [
  { id: 'agreement', title: 'Agreement and Acceptance' },
  { id: 'service', title: 'Description of Service' },
  { id: 'accounts', title: 'User Accounts' },
  { id: 'content', title: 'Content Rights' },
  { id: 'usage', title: 'Acceptable Use' },
  { id: 'subscriptions', title: 'Subscriptions & Payments' },
  { id: 'intellectual', title: 'Intellectual Property' },
  { id: 'third-party', title: 'Third-Party Services' },
  { id: 'disclaimer', title: 'Disclaimers' },
  { id: 'liability', title: 'Liability & Indemnity' },
  { id: 'general', title: 'General Provisions' },
];

const Terms: React.FC = () => {
  return (
    <div id="terms-top" className="pb-10 pt-10">
      <Seo title="Terms of Service" description="The terms that govern your use of The Age of GenZ, our content policies and your rights and responsibilities." path="/terms/" />

      <div className="container mx-auto px-4 max-w-6xl">
        <EnglishOnlyNote className="mx-auto mb-6 w-fit" />
        <section className="mb-10 text-center bg-card rounded-lg border border-border p-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-mist text-secondary-foreground rounded-full text-sm font-medium mb-4">
            <ShieldCheck className="w-4 h-4" />
            Legal Framework
          </div>
          <h1 className="font-display text-5xl font-medium tracking-[-0.025em] text-foreground md:text-6xl mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Legal agreement governing your use of The Age Of GenZ platform
          </p>
          <p className="text-muted-foreground text-base">
            <strong>Last Updated:</strong> January 15, 2025 | <strong>Effective Date:</strong> January 15, 2025
          </p>
          <div className="w-24 h-1 bg-primary mx-auto rounded mt-6"></div>

          <div className="mt-8 grid gap-6 md:grid-cols-3 text-left">
            <div className="p-4 rounded-xl border border-border bg-card ">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                What this covers
              </h3>
              <p className="text-sm text-muted-foreground">
                Rules for using our content, services, community spaces, and subscription products.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card ">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Your responsibilities
              </h3>
              <p className="text-sm text-muted-foreground">
                Keep your account secure, respect intellectual property, and follow fair-use guidelines.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card ">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                How we resolve issues
              </h3>
              <p className="text-sm text-muted-foreground">
                Our dispute-resolution approach prioritises collaboration before formal legal steps.
              </p>
            </div>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72">
            <div className="sticky top-24 bg-card border border-border rounded-xl p-6">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">On this page</h2>
              <nav aria-label="Terms of Service sections">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {sectionNav.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-mist hover:text-primary transition-colors"
                      >
                        <span className="block h-1 w-1 rounded-full bg-border-border" />
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-6 p-4 bg-mist border border-primary/30 rounded-lg text-sm text-primary">
                <p className="font-semibold mb-1 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Need clarification?
                </p>
                <p className="mb-3">
                  Reach out to our legal team for bespoke guidance regarding these terms.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary font-medium"
                >
                  Contact Support <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="bg-card rounded-lg border border-border overflow-hidden">
          {/* Introduction */}
          <section id="agreement" className="p-8 border-b border-border">
            <h2 className="text-2xl font-medium mb-4 text-foreground border-b-2 border-primary pb-2 inline-block">
              1. Agreement and Acceptance
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/80">
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
          <section id="service" className="p-8 bg-muted/40 border-b border-border">
            <h2 className="text-2xl font-medium mb-4 text-foreground border-b-2 border-primary pb-2 inline-block">
              2. Description of Service
            </h2>
            <div className="space-y-4">
              <p className="text-foreground/80 leading-relaxed">
                The Age Of GenZ is a professional news and media organization providing journalistic content 
                across multiple categories including world news, politics, culture, technology, sports, opinions, 
                and insights. Our mission is to deliver "NEWS YOU CAN VIBE WITH" to a global audience.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Our Services Include:</h4>
                  <ul className="list-disc pl-6 space-y-1 text-foreground/80 text-sm">
                    <li>Daily news articles and reporting</li>
                    <li>Opinion and analysis pieces</li>
                    <li>Newsletter subscriptions</li>
                    <li>Comment and community features</li>
                    <li>Social media integration</li>
                    <li>Mobile and web applications</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Coverage Areas:</h4>
                  <ul className="list-disc pl-6 space-y-1 text-foreground/80 text-sm">
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
          <section id="accounts" className="p-8 border-b border-border">
            <h2 className="text-2xl font-medium mb-4 text-foreground border-b-2 border-primary pb-2 inline-block">
              3. User Accounts and Registration
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">3.1 Account Creation</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  To access certain features of our Service, you must register for an account. When creating an account, you agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                  <li>Provide accurate, complete, and current information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security and confidentiality of your password</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized access</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">3.2 Account Responsibilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-mist border border-primary/30 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2 flex items-center gap-1.5"><CircleCheck className="size-4" aria-hidden="true" /> You Must</h4>
                    <ul className="text-primary text-sm space-y-1">
                      <li>• Use your real identity</li>
                      <li>• Provide valid email address</li>
                      <li>• Secure your login credentials</li>
                      <li>• Follow community guidelines</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-muted border border-destructive/40 rounded-lg">
                    <h4 className="font-semibold text-destructive mb-2 flex items-center gap-1.5"><CircleX className="size-4" aria-hidden="true" /> You Must Not</h4>
                    <ul className="text-destructive text-sm space-y-1">
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
          <section id="content" className="p-8 bg-muted/40 border-b border-border">
            <h2 className="text-2xl font-medium mb-4 text-foreground border-b-2 border-primary pb-2 inline-block">
              4. Content and Intellectual Property
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">4.1 Our Content</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  All content published by The Age Of GenZ, including articles, images, videos, graphics, 
                  logos, and design elements, is protected by copyright and other intellectual property laws. 
                  This content is owned by The Age Of GenZ LLC or licensed from third parties.
                </p>
                
                <div className="bg-mist border border-primary p-4 rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Permitted Uses</h4>
                  <ul className="text-primary text-sm space-y-1">
                    <li>• Personal, non-commercial reading and research</li>
                    <li>• Social media sharing with proper attribution</li>
                    <li>• Brief excerpts for educational or commentary purposes (fair use)</li>
                    <li>• Linking to our articles from other websites</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">4.2 User-Generated Content</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  When you submit comments, feedback, or other content to our Service, you grant us a 
                  worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display 
                  such content in connection with our Service.
                </p>
                
                <div className="space-y-4">
                  <div className="p-4 bg-muted border border-border rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Content Standards</h4>
                    <p className="text-foreground text-sm">
                      All user content must be respectful, factual, and comply with applicable laws. 
                      We reserve the right to remove content that violates our community guidelines.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">4.3 DMCA and Copyright Infringement</h3>
                <p className="text-foreground/80 leading-relaxed">
                  We respect intellectual property rights and respond to valid DMCA takedown notices. 
                  If you believe your copyrighted work has been infringed, contact us at 
                  <a href="mailto:contact@theageofgenz.com" className="ml-1 text-primary underline underline-offset-2 hover:decoration-2">
                    contact@theageofgenz.com
                  </a>
                  with detailed information about the alleged infringement.
                </p>
              </div>
            </div>
          </section>

          {/* Acceptable Use Policy */}
          <section id="usage" className="p-8 border-b border-border">
            <h2 className="text-2xl font-medium mb-4 text-foreground border-b-2 border-primary pb-2 inline-block">
              5. Acceptable Use Policy
            </h2>
            <div className="space-y-6">
              <p className="text-foreground/80 leading-relaxed">
                You agree to use our Service responsibly and in compliance with all applicable laws. 
                The following activities are strictly prohibited:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border border-destructive/40 rounded-lg">
                    <h4 className="font-semibold text-destructive mb-2 flex items-center gap-1.5"><Ban className="size-4" aria-hidden="true" /> Prohibited Content</h4>
                    <ul className="text-destructive text-sm space-y-1">
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
                  <div className="p-4 border border-destructive/40 rounded-lg">
                    <h4 className="font-semibold text-destructive mb-2 flex items-center gap-1.5"><Ban className="size-4" aria-hidden="true" /> Prohibited Activities</h4>
                    <ul className="text-destructive text-sm space-y-1">
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

              <div className="bg-mist border border-primary/30 p-4 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">Enforcement</h4>
                <p className="text-primary text-sm">
                  Violations may result in content removal, account suspension, or termination. 
                  We reserve the right to investigate and take appropriate legal action for serious violations.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy and Data */}
          <section id="subscriptions" className="p-8 bg-muted/40 border-b border-border">
            <h2 className="text-2xl font-medium mb-4 text-foreground border-b-2 border-primary pb-2 inline-block">
              6. Privacy and Data Protection
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/80">
              <p className="mb-4">
                Your privacy is important to us. Our collection, use, and protection of your personal information 
                is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-mist border border-primary rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Data We Collect</h4>
                  <ul className="text-primary text-sm space-y-1">
                    <li>• Account registration information</li>
                    <li>• Usage and analytics data</li>
                    <li>• Comments and user content</li>
                    <li>• Newsletter subscription preferences</li>
                  </ul>
                </div>
                <div className="p-4 bg-mist border border-primary/30 rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Your Rights</h4>
                  <ul className="text-primary text-sm space-y-1">
                    <li>• Access and update your data</li>
                    <li>• Request data deletion</li>
                    <li>• Opt-out of marketing communications</li>
                    <li>• Data portability and correction</li>
                  </ul>
                </div>
              </div>
              
              <p className="mt-4">
                For detailed information about our privacy practices, please review our 
                <Link to="/privacy" className="ml-1 text-primary underline underline-offset-2 hover:decoration-2">Privacy Policy</Link>.
              </p>
            </div>
          </section>

          {/* Disclaimers and Limitation of Liability */}
          <section id="intellectual" className="p-8 border-b border-border">
            <h2 className="text-2xl font-medium mb-4 text-foreground border-b-2 border-primary pb-2 inline-block">
              7. Disclaimers and Limitation of Liability
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">7.1 Service Disclaimers</h3>
                <div className="bg-muted border border-border p-6 rounded-lg">
                  <p className="text-foreground font-semibold mb-3">IMPORTANT DISCLAIMER:</p>
                  <p className="text-foreground text-sm leading-relaxed">
                    Our Service is provided "as is" and "as available" without warranties of any kind, either express or implied. 
                    While we strive for accuracy in our reporting, we do not guarantee that our content is error-free, 
                    complete, or current. News and information can change rapidly, and we may not be able to update 
                    all content immediately.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">7.2 Editorial Independence</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Our editorial content reflects the professional judgment of our journalists and editors. 
                  Opinions expressed in editorials and opinion pieces are those of the authors and do not 
                  necessarily represent the views of The Age Of GenZ LLC, its employees, or affiliates.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">7.3 Limitation of Liability</h3>
                <div className="prose prose-sm max-w-none text-foreground/80">
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
          <section id="third-party" className="p-8 bg-muted/40 border-b border-border">
            <h2 className="text-2xl font-medium mb-4 text-foreground border-b-2 border-primary pb-2 inline-block">
              8. Indemnification
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/80">
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
          <section id="disclaimer" className="p-8 border-b border-border">
            <h2 className="text-2xl font-medium mb-4 text-foreground border-b-2 border-primary pb-2 inline-block">
              9. Termination
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">9.1 Termination by You</h3>
                <p className="text-foreground/80 leading-relaxed">
                  You may terminate your account at any time by contacting us at 
                  <a href="mailto:contact@theageofgenz.com" className="ml-1 text-primary underline underline-offset-2 hover:decoration-2">
                    contact@theageofgenz.com
                  </a>. 
                  Upon termination, your right to use the Service will cease immediately.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">9.2 Termination by Us</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  We may terminate or suspend your account and access to the Service immediately, 
                  without prior notice, for conduct that we believe violates these Terms or is harmful 
                  to other users, us, or third parties.
                </p>
                
                <div className="bg-muted border border-destructive/40 p-4 rounded-lg">
                  <h4 className="font-semibold text-destructive mb-2">Grounds for Termination</h4>
                  <ul className="text-destructive text-sm space-y-1">
                    <li>• Violation of these Terms or our policies</li>
                    <li>• Fraudulent or illegal activity</li>
                    <li>• Harassment of other users or staff</li>
                    <li>• Repeated posting of prohibited content</li>
                    <li>• Security breaches or attempted unauthorized access</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">9.3 Effect of Termination</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Upon termination, all provisions of these Terms which by their nature should survive 
                  termination shall survive, including ownership provisions, warranty disclaimers, 
                  indemnity, and limitations of liability.
                </p>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <section id="liability" className="p-8 bg-muted/40 border-b border-border">
            <h2 className="text-2xl font-medium mb-4 text-foreground border-b-2 border-primary pb-2 inline-block">
              10. Governing Law and Dispute Resolution
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">10.1 Governing Law</h3>
                <p className="text-foreground/80 leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of Bangladesh, 
                  without regard to its conflict of law provisions. Any legal action or proceeding arising 
                  under these Terms will be brought exclusively in the courts of Dhaka, Bangladesh.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">10.2 Dispute Resolution</h3>
                <div className="space-y-4">
                  <p className="text-foreground/80 leading-relaxed">
                    Before pursuing formal legal action, we encourage you to contact us to discuss the matter 
                    and seek a resolution. Many disputes can be resolved quickly and amicably through direct communication.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-card rounded-lg border border-border">
                      <div className="w-10 h-10 bg-mist rounded-lg mx-auto mb-2 flex items-center justify-center text-primary">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-foreground text-sm">Step 1: Direct Contact</h4>
                      <p className="text-xs text-muted-foreground mt-1">Email us with your concern</p>
                    </div>
                    <div className="text-center p-4 bg-card rounded-lg border border-border">
                      <div className="w-10 h-10 bg-mist rounded-lg mx-auto mb-2 flex items-center justify-center text-primary">
                        <Users className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-foreground text-sm">Step 2: Negotiation</h4>
                      <p className="text-xs text-muted-foreground mt-1">Work together on a solution</p>
                    </div>
                    <div className="text-center p-4 bg-card rounded-lg border border-border">
                      <div className="w-10 h-10 bg-mist rounded-lg mx-auto mb-2 flex items-center justify-center text-primary">
                        <Gavel className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-foreground text-sm">Step 3: Legal Action</h4>
                      <p className="text-xs text-muted-foreground mt-1">If necessary, pursue formal resolution</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* General Provisions */}
          <section id="general" className="p-8">
            <h2 className="text-2xl font-medium mb-4 text-foreground border-b-2 border-primary pb-2 inline-block">
              11. General Provisions
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Changes to Terms</h4>
                  <p className="text-foreground/80 text-sm">
                    We reserve the right to modify these Terms at any time. We will notify users of 
                    significant changes via email or website notice.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Severability</h4>
                  <p className="text-foreground/80 text-sm">
                    If any provision of these Terms is held to be invalid or unenforceable, 
                    the remaining provisions will remain in full force and effect.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Entire Agreement</h4>
                  <p className="text-foreground/80 text-sm">
                    These Terms, together with our Privacy Policy, constitute the entire agreement 
                    between you and The Age Of GenZ LLC.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Assignment</h4>
                  <p className="text-foreground/80 text-sm">
                    We may assign our rights and obligations under these Terms without restriction. 
                    You may not assign your rights without our written consent.
                  </p>
                </div>
              </div>

              <div className="mt-8 p-6 bg-mist border border-primary/30 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-primary">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-primary mb-1"><strong>Legal Inquiries:</strong></p>
                    <p className="text-primary">
                      <a href="mailto:contact@theageofgenz.com" className="underline underline-offset-2 hover:decoration-2">
                        contact@theageofgenz.com
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-primary mb-1"><strong>Mailing Address:</strong></p>
                    <p className="text-primary text-sm">
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
      </div>
    </div>

    <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="p-6 bg-card border border-border rounded-xl ">
          <div className="flex items-start gap-3">
            <FileText className="w-10 h-10 text-primary" />
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Need a signed copy?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Request an executed agreement or compliance documentation tailored for your organisation.
              </p>
              <Link to="/contact" className="inline-flex items-center gap-2 text-primary hover:text-primary font-medium">
                Contact legal team <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
        <div className="p-6 bg-card border border-border rounded-xl ">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-10 h-10 text-primary" />
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Questions about compliance?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Explore our privacy practices, editorial standards, and escalation process for reporting issues.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/privacy" className="inline-flex items-center gap-2 text-primary hover:text-primary font-medium">
                  Privacy policy <ExternalLink className="w-4 h-4" />
                </Link>
                <a
                  href="mailto:contact@theageofgenz.com"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary font-medium"
                >
                  Email support <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Footer Navigation */}
        <div className="mt-12 text-center">
          <a
            href="#terms-top"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary mb-6"
          >
            Back to top <ArrowUpRight className="w-4 h-4" />
          </a>
          <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/" className="text-primary hover:text-primary transition-colors">
              Return to Home
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
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

export default Terms;
