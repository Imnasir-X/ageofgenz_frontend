import React from 'react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <section className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Terms of Service
          </h1>
          <p className="text-gray-600 text-base">
            Last Updated: April 30, 2025
          </p>
        </section>

        <div className="bg-gray-900 rounded border border-gray-800 p-6 shadow-lg">
          <section className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-white border-b-2 border-orange-500 pb-2">
              1. Agreement to Terms
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              By accessing or using our website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-white border-b-2 border-orange-500 pb-2">
              2. Use License
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              Permission is granted to temporarily access the materials on our website for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license, you may not:
            </p>
            <ul className="list-disc pl-6 mb-3 text-gray-300 text-sm leading-relaxed">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
            <p className="text-gray-300 text-sm leading-relaxed">
              This license shall automatically terminate if you violate any of these restrictions and may be terminated by us at any time.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-white border-b-2 border-orange-500 pb-2">
              3. User Accounts
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              When you create an account with us, you must provide accurate, complete, and current information at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You agree not to disclose your password to any third party.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-white border-b-2 border-orange-500 pb-2">
              4. Content
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              Our website may allow you to post, link, store, share, and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post, including its legality, reliability, and appropriateness.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              By posting content, you grant us the right to use, reproduce, modify, perform, display, distribute, and otherwise disclose to third parties any such material according to your account settings.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-white border-b-2 border-orange-500 pb-2">
              5. Limitation of Liability
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              In no event shall we, our directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc pl-6 mb-3 text-gray-300 text-sm leading-relaxed">
              <li>Your access to or use of or inability to access or use the service</li>
              <li>Any conduct or content of any third party on the service</li>
              <li>Any content obtained from the service</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-white border-b-2 border-orange-500 pb-2">
              6. Contact Us
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              If you have any questions about these Terms, please contact us at:
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

export default Terms;