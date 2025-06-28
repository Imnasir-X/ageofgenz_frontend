import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitContactForm } from '../utils/api';

const Contact: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Client-side validation
    if (!name.trim()) {
      setError('Name is required.');
      setLoading(false);
      return;
    }
    if (!email.trim()) {
      setError('Email is required.');
      setLoading(false);
      return;
    }
    if (!message.trim()) {
      setError('Message is required.');
      setLoading(false);
      return;
    }

    try {
      await submitContactForm({ name, email, message });
      console.log('Contact form submitted successfully:', { name, email, message }); // Debug: Log successful submission
      setSuccess('Thank you! Your message has been sent successfully.');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      console.error('Contact Form Error:', err.response ? err.response.data : err.message); // Debug: Log error
      setError(err.response?.data?.message || 'Failed to send your message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <section className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Contact Us
          </h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            Have a question or feedback? We’d love to hear from you!
          </p>
        </section>

        <div className="bg-gray-900 rounded border border-gray-800 p-6 shadow-lg max-w-md mx-auto">
          {success && <p className="text-green-500 mb-4 text-center">{success}</p>}
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          {loading && (
            <div className="flex justify-center items-center py-4">
              <div className="w-10 h-10 border-4 border-gray-600 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block mb-2 text-white font-semibold">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                required
                disabled={loading}
                placeholder="Your name"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block mb-2 text-white font-semibold">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                required
                disabled={loading}
                placeholder="Your email"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="message" className="block mb-2 text-white font-semibold">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y disabled:opacity-50"
                rows={5}
                required
                disabled={loading}
                placeholder="Your message"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <p className="text-gray-400 mb-1">Or reach us directly at:</p>
            <p>
              <a href="mailto:support@theageofgenz.com" className="text-orange-500 hover:text-orange-600 transition-colors">
                support@theageofgenz.com
              </a>
            </p>
          </div>
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

export default Contact;