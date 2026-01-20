// src/pages/ForgotPassword.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../utils/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [lastSubmittedEmail, setLastSubmittedEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const trimmedEmail = email.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await requestPasswordReset(trimmedEmail);
      setLastSubmittedEmail(trimmedEmail);
      setSubmitted(true);
      setEmail('');
    } catch (err) {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Forgot Your Password?</h1>
          <p className="mt-2 text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <div className="bg-gray-900 rounded border border-gray-800 p-8 shadow-lg">
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              {error && (
                <p id="email-error" className="text-red-500 mb-4 text-center" aria-live="assertive">
                  {error}
                </p>
              )}
              <div className="mb-6">
                <label htmlFor="email" className="block mb-2 text-white">Email address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                  disabled={loading}
                  aria-describedby={error ? 'email-error' : undefined}
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading || !isEmailValid}
                aria-disabled={loading || !isEmailValid}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              
              <div className="mt-4 text-center">
                <Link to="/login" className="text-orange-500 hover:text-orange-600 transition-colors">
                  Return to Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center" role="status" aria-live="polite">
              <div className="text-green-500 mb-4 text-5xl" aria-hidden="true">
                &#10003;
              </div>
              <h2 className="text-xl font-bold mb-2 text-white">Reset Email Sent</h2>
              <p className="mb-4 text-gray-300">
                If an account exists with {lastSubmittedEmail || 'the provided address'}, you will receive an email with instructions to reset your password.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setError('');
                }}
                className="text-orange-500 hover:text-orange-600 transition-colors"
                aria-label="Try another email"
              >
                Try another email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
