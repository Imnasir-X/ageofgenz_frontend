import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { submitContactForm } from '../utils/api';
import { Mail, MapPin, Clock, MessageCircle, FileText, UserPlus, Shield } from 'lucide-react';

const Contact: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('general');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');

  // ✅ FIXED: Line 40 - Updated handleSubmit function
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
      // ✅ FIX: Format the message to include subject information
      const formattedMessage = `Subject: ${contactReasons.find(reason => reason.value === subject)?.label || 'General Inquiry'}

${message}`;

      // ✅ FIX: Send data in the format your API expects
      await submitContactForm({ 
        name: name.trim(), 
        email: email.trim(), 
        message: formattedMessage.trim() 
      });

      setSuccess('Thank you! Your message has been sent successfully. We typically respond within 24-48 hours.');
      setName('');
      setEmail('');
      setSubject('general');
      setMessage('');
    } catch (err: any) {
      console.error('Contact Form Error:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Failed to send your message. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  const contactReasons = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'editorial', label: 'Editorial Submission' },
    { value: 'press', label: 'Press Inquiry' },
    { value: 'partnership', label: 'Partnership Opportunity' },
    { value: 'careers', label: 'Career Opportunity' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'feedback', label: 'Feedback & Suggestions' },
    { value: 'legal', label: 'Legal Matter' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Helmet>
        <title>Contact Us - The Age Of GenZ | Professional News Organization</title>
        <meta name="description" content="Contact The Age Of GenZ news organization. Located in Dhaka, Bangladesh. Reach us for editorial submissions, press inquiries, partnerships, and more." />
        <meta name="keywords" content="contact The Age Of GenZ, news organization contact, editorial submissions, press inquiries, Dhaka Bangladesh" />
      </Helmet>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contact The Age Of GenZ
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            We value your input and are here to help. Whether you have a story tip, partnership inquiry, 
            or feedback, we'd love to hear from you.
          </p>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded"></div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b-2 border-orange-500 pb-3">
                Send Us a Message
              </h2>
              
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
                  {success}
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}
              {loading && (
                <div className="flex justify-center items-center py-4 mb-6">
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600">Sending your message...</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                      required
                      disabled={loading}
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                      required
                      disabled={loading}
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    What's this about? *
                  </label>
                  <select
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                    required
                    disabled={loading}
                  >
                    {contactReasons.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-y disabled:opacity-50 disabled:bg-gray-100"
                    rows={6}
                    required
                    disabled={loading}
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Primary Contact */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-orange-500" />
                Primary Contact
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a 
                    href="mailto:contact@theageofgenz.com" 
                    className="text-orange-500 hover:text-orange-600 transition-colors font-medium"
                  >
                    contact@theageofgenz.com
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Response Time</p>
                  <p className="text-gray-800 font-medium">24-48 hours</p>
                </div>
              </div>
            </div>

            {/* Office Location */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-orange-500" />
                Headquarters
              </h3>
              <div className="space-y-2">
                <p className="text-gray-800 font-medium">The Age Of GenZ LLC</p>
                <p className="text-gray-600">71 No. Councilor Street</p>
                <p className="text-gray-600">Dhaka, Bangladesh</p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Global Coverage</p>
                  <p className="text-gray-800">Serving US, Europe & Asia</p>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-500" />
                Newsroom Hours
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="text-gray-800 font-medium">9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Weekend</span>
                  <span className="text-gray-800 font-medium">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Zone</span>
                  <span className="text-gray-800 font-medium">Bangladesh Standard Time</span>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  *Breaking news coverage 24/7
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  to="/join"
                  className="flex items-center p-3 bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors group"
                >
                  <UserPlus className="w-5 h-5 mr-3 text-gray-600 group-hover:text-orange-500" />
                  <div>
                    <p className="font-medium text-gray-900">Join Our Team</p>
                    <p className="text-sm text-gray-600">Career opportunities</p>
                  </div>
                </Link>
                
                <Link 
                  to="/about"
                  className="flex items-center p-3 bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors group"
                >
                  <FileText className="w-5 h-5 mr-3 text-gray-600 group-hover:text-orange-500" />
                  <div>
                    <p className="font-medium text-gray-900">About Us</p>
                    <p className="text-sm text-gray-600">Learn our story</p>
                  </div>
                </Link>

                <Link 
                  to="/privacy"
                  className="flex items-center p-3 bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors group"
                >
                  <Shield className="w-5 h-5 mr-3 text-gray-600 group-hover:text-orange-500" />
                  <div>
                    <p className="font-medium text-gray-900">Privacy Policy</p>
                    <p className="text-sm text-gray-600">Data protection</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <section className="mt-12 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">
            For Specific Inquiries
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <MessageCircle className="w-8 h-8 mx-auto mb-3 text-orange-500" />
              <h4 className="font-semibold text-gray-900 mb-2">Editorial Tips</h4>
              <p className="text-sm text-gray-600 mb-3">Have a story idea or news tip?</p>
              <p className="text-sm font-medium text-orange-500">Use "Editorial Submission" category</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <FileText className="w-8 h-8 mx-auto mb-3 text-orange-500" />
              <h4 className="font-semibold text-gray-900 mb-2">Press Inquiries</h4>
              <p className="text-sm text-gray-600 mb-3">Media seeking information?</p>
              <p className="text-sm font-medium text-orange-500">Use "Press Inquiry" category</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <UserPlus className="w-8 h-8 mx-auto mb-3 text-orange-500" />
              <h4 className="font-semibold text-gray-900 mb-2">Partnerships</h4>
              <p className="text-sm text-gray-600 mb-3">Business collaboration?</p>
              <p className="text-sm font-medium text-orange-500">Use "Partnership" category</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Shield className="w-8 h-8 mx-auto mb-3 text-orange-500" />
              <h4 className="font-semibold text-gray-900 mb-2">Legal Matters</h4>
              <p className="text-sm text-gray-600 mb-3">Copyright or legal issues?</p>
              <p className="text-sm font-medium text-orange-500">Use "Legal Matter" category</p>
            </div>
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/" className="text-orange-500 hover:text-orange-600 transition-colors">
              ← Return to Home
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-orange-600 transition-colors">
              About Us
            </Link>
            <Link to="/join" className="text-gray-600 hover:text-orange-600 transition-colors">
              Careers
            </Link>
            <Link to="/privacy" className="text-gray-600 hover:text-orange-600 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;