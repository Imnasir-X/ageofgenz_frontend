import React from 'react';
import { Link } from 'react-router-dom';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <section className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Privacy Policy
          </h1>
          <p className="text-gray-600 text-base">
            Last Updated: April 30, 2025
          </p>
        </section>

        <div className="bg-gray-900 rounded border border-gray-800 p-6 shadow-lg">
          <section className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-white border-b-2 border-orange-500 pb-2">
              1. Introduction
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              At THE AGE OF GENZ, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you visit our website or use our services.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-white border-b-2 border-orange-500 pb-2">
              2. Information We Collect
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              We may collect the following types of information:
            </p>
            <ul className="list-disc pl-6 mb-3 text-gray-300 text-sm leading-relaxed">
              <li className="mb-2">
                <strong>Personal Information:</strong> Name, email address, and other details you provide when creating an account, subscribing to our newsletter, or contacting us.
              </li>
              <li className="mb-2">
                <strong>Usage Data:</strong> Information about how you interact with our site, such as IP address, browser type, pages visited, and time spent.
              </li>
              <li>
                <strong>Cookies:</strong> Small data files stored on your device to enhance your experience (see Section 4).
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-white border-b-2 border-orange-500 pb-2">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              We use your data to:
            </p>
            <ul className="list-disc pl-6 mb-3 text-gray-300 text-sm leading-relaxed">
              <li className="mb-2">Provide and improve our services, including personalized content.</li>
              <li className="mb-2">Communicate with you, such as responding to inquiries or sending newsletters.</li>
              <li className="mb-2">Analyze usage trends to enhance site functionality.</li>
              <li>Ensure the security and integrity of our platform.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-white border-b-2 border-orange-500 pb-2">
              4. Cookies and Tracking
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              We dont use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 mb-3 text-gray-300 text-sm leading-relaxed">
              <li className="mb-2">Remember your preferences and login status.</li>
              <li className="mb-2">Track site performance and user behavior.</li>
              <li>Deliver relevant ads or content (optional, if applicable).</li>
            </ul>
            <p className="text-gray-300 text-sm leading-relaxed">
              You can manage cookie preferences through your browser settings. Disabling cookies may limit some features.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-white border-b-2 border-orange-500 pb-2">
              5. Sharing Your Information
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              We do not sell your personal data. We may share it with:
            </p>
            <ul className="list-disc pl-6 mb-3 text-gray-300 text-sm leading-relaxed">
              <li className="mb-2">Service providers who assist with site operations (e.g., hosting, analytics).</li>
              <li className="mb-2">Legal authorities if required by law or to protect our rights.</li>
              <li>Third parties with your consent (e.g., newsletter partners).</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-white border-b-2 border-orange-500 pb-2">
              6. Your Rights
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              Depending on your location, you may have rights to:
            </p>
            <ul className="list-disc pl-6 mb-3 text-gray-300 text-sm leading-relaxed">
              <li className="mb-2">Access, correct, or delete your personal data.</li>
              <li className="mb-2">Opt out of marketing communications.</li>
              <li>Request data portability or object to certain processing.</li>
            </ul>
            <p className="text-gray-300 text-sm leading-relaxed">
              To exercise these rights, contact us at{' '}
              <a href="mailto:support@theageofgenz.com" className="text-orange-500 hover:text-orange-600 transition-colors">
                support@theageofgenz.com
              </a>.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-white border-b-2 border-orange-500 pb-2">
              7. Contact Us
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              Questions about this Privacy Policy? Reach out to us:
            </p>
            <div className="bg-gray-800 p-4 rounded border border-gray-700 text-sm">
              <p className="text-gray-300 mb-1">
                Email:{' '}
                <a href="mailto:support@theageofgenz.com" className="text-orange-500 hover:text-orange-600 transition-colors">
                  support@theageofgenz.com
                </a>
              </p>
              <p className="text-gray-300">
                Address: 123 GenZ Avenue, News City, CA 90210
              </p>
            </div>
          </section>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-orange-500 hover:text-orange-600 transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Privacy;