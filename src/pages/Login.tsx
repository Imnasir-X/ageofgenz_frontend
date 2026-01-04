import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, getUserProfile } from '../utils/api';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [socialLoading, setSocialLoading] = useState<boolean>(false);
  const errorRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, socialLogin, setAuthTokens, setUser } = useAuth();
  const REMEMBERED_EMAIL_KEY = 'aoz_remembered_email';

  useEffect(() => {
    const storedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (storedEmail) {
      setFormData((prev) => ({ ...prev, email: storedEmail }));
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const access = params.get('access');
    const refresh = params.get('refresh');
    const errorParam = params.get('error');

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      return;
    }

    if (access && refresh) {
      const completeSocialLogin = async () => {
        setLoading(true);
        setAuthTokens(access, refresh);
        try {
          const profileResponse = await getUserProfile();
          setUser(profileResponse.data);
          navigate('/home', { replace: true });
        } catch (err: any) {
          localStorage.removeItem('token');
          localStorage.removeItem('refresh');
          setError(err?.message || 'Social login failed. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      completeSocialLogin();
    }
  }, [location.search, navigate, setAuthTokens, setUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const loadGoogleScript = () => new Promise<void>((resolve, reject) => {
    const googleApi = (window as any)?.google;
    if (googleApi?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existing = document.getElementById('google-identity');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google login')));
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-identity';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google login'));
    document.head.appendChild(script);
  });

  const handleGoogleLogin = async () => {
    setError('');
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Google login is not configured.');
      return;
    }
    setSocialLoading(true);
    try {
      await loadGoogleScript();
      const googleApi = (window as any)?.google;
      if (!googleApi?.accounts?.oauth2) {
        throw new Error('Google login is not available.');
      }
      const tokenClient = googleApi.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        callback: async (tokenResponse: { access_token?: string; error?: string }) => {
          if (tokenResponse?.error || !tokenResponse?.access_token) {
            setError('Google login failed. Please try again.');
            setSocialLoading(false);
            return;
          }
          try {
            await socialLogin('google', tokenResponse.access_token);
            navigate('/home');
          } catch (err: any) {
            setError(err?.message || 'Google login failed.');
          } finally {
            setSocialLoading(false);
          }
        },
      });
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err: any) {
      setError(err?.message || 'Google login failed. Please try again.');
      setSocialLoading(false);
    }
  };

  const handleXLogin = () => {
    setError('');
    const email = formData.email.trim();
    if (!email) {
      setError('Email is required for X login.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address for X login.');
      return;
    }
    setSocialLoading(true);
    const params = new URLSearchParams({ email });
    window.location.href = `${API_BASE_URL}/api/auth/social-auth/x/login/?${params.toString()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Client-side validation
    if (!formData.email.trim()) {
      setError('Email is required.');
      setLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    if (!formData.password.trim()) {
      setError('Password is required.');
      setLoading(false);
      return;
    }

    try {
      await login(formData.email, formData.password);
      if (rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, formData.email);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
      navigate('/home');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.non_field_errors?.[0] || 
                          err.message || 
                          'Login failed. Please check your email and password and try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <Helmet>
        <title>Login | The Age of GenZ</title>
        <meta
          name="description"
          content="Access your The Age of GenZ account to manage subscriptions, bookmarks, and personalized news."
        />
      </Helmet>
      <div className="container mx-auto px-4 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div
                ref={errorRef}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md"
                role="alert"
                aria-live="assertive"
                tabIndex={-1}
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                required
                disabled={loading || socialLoading}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                required
                disabled={loading || socialLoading}
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              <Link 
                to="/forgot-password" 
                className="text-sm text-orange-600 hover:text-orange-500"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || socialLoading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-gray-500">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading || socialLoading}
              >
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.22l6.86-6.86C35.84 2.19 30.27 0 24 0 14.62 0 6.52 5.38 2.56 13.22l7.98 6.19C12.52 13 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.5 24.5c0-1.57-.14-3.09-.4-4.5H24v9h12.7c-.55 2.9-2.16 5.36-4.6 7.03l7.08 5.5c4.14-3.82 6.32-9.45 6.32-17.03z"/>
                  <path fill="#FBBC05" d="M10.54 28.41c-.54-1.62-.85-3.35-.85-5.16 0-1.81.31-3.54.85-5.16l-7.98-6.19C1.02 14.83 0 19.29 0 24.25c0 4.96 1.02 9.42 2.56 13.35l7.98-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.27 0 11.55-2.08 15.4-5.64l-7.08-5.5c-1.96 1.32-4.48 2.1-8.32 2.1-6.26 0-11.48-3.5-13.46-8.59l-7.98 6.19C6.52 42.62 14.62 48 24 48z"/>
                </svg>
                Continue with Google
              </button>
              <button
                type="button"
                onClick={handleXLogin}
                className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading || socialLoading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.616l-5.186-6.78-5.93 6.78H1.784l7.73-8.84-8.158-10.66H8.1l4.684 6.19 5.46-6.19zm-1.162 17.52h1.832L7.1 4.13H5.188l11.894 15.64z"/>
                </svg>
                Continue with X
              </button>
            </div>
            <p className="text-xs text-gray-500">
              X login uses the email entered above to create or link your account.
            </p>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-orange-600 hover:text-orange-500 font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link to="/home" className="text-orange-600 hover:text-orange-500 text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
