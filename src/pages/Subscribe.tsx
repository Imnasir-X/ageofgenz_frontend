import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

interface Subscription {
  id: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  plan: {
    name: string;
    amount: number;
    interval: 'month' | 'year';
  };
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

const Subscribe: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'basic_monthly',
      name: 'Basic',
      description: 'Support our journalism',
      price: 1,
      interval: 'month',
      features: [
        'Ad-free reading',
        'Support independent journalism',
        'Monthly newsletter',
        'Access to all articles'
      ]
    },
    {
      id: 'premium_monthly',
      name: 'Premium',
      description: 'Full access to everything',
      price: 5,
      interval: 'month',
      features: [
        'Everything in Basic',
        'Exclusive premium content',
        'Early access to new features',
        'Weekly premium newsletter',
        'Direct support line',
        'Comment on articles'
      ],
      popular: true
    },
    {
      id: 'premium_yearly',
      name: 'Premium Yearly',
      description: 'Best value - save 40%',
      price: 36,
      interval: 'year',
      features: [
        'Everything in Premium',
        'Save $24 per year',
        'Annual exclusive report',
        'Priority customer support',
        'Exclusive events access'
      ]
    }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscription();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/api/subscriptions/current/');
      setSubscription(response.data);
    } catch (err) {
      console.log('No active subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      sessionStorage.setItem('subscriptionIntent', planId);
      navigate('/login');
      return;
    }

    setUpdating(true);
    setError('');

    try {
      const response = await api.post('/api/subscriptions/create-checkout/', {
        plan_id: planId
      });

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.session_id
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to start subscription');
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!subscription) return;

    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.'
    );

    if (!confirmed) return;

    setUpdating(true);
    setError('');

    try {
      await api.post(`/api/subscriptions/${subscription.id}/cancel/`);
      setSuccess('Subscription cancelled. You will continue to have access until the end of your billing period.');
      fetchSubscription();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setUpdating(false);
    }
  };

  const handleReactivate = async () => {
    if (!subscription) return;

    setUpdating(true);
    setError('');

    try {
      await api.post(`/api/subscriptions/${subscription.id}/reactivate/`);
      setSuccess('Subscription reactivated successfully!');
      fetchSubscription();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reactivate subscription');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Subscribe to The Age Of GenZ</h1>
        <p className="text-xl text-gray-600 mb-2">Support independent journalism that speaks to your generation</p>
        <p className="text-gray-500">Join thousands of readers who trust us for authentic news and insights</p>
      </div>

      {/* Current Subscription Status */}
      {subscription && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-3">
                {subscription.status === 'active' ? (
                  <CheckCircle className="text-green-500 mr-2" size={24} />
                ) : subscription.status === 'cancelled' ? (
                  <XCircle className="text-yellow-500 mr-2" size={24} />
                ) : (
                  <AlertCircle className="text-red-500 mr-2" size={24} />
                )}
                <span className="text-lg font-medium capitalize">{subscription.status}</span>
              </div>
              
              <p className="text-gray-600 mb-2">
                <strong>Plan:</strong> {subscription.plan.name}
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Amount:</strong> ${subscription.plan.amount}/{subscription.plan.interval}
              </p>
              <p className="text-gray-600 mb-2">
                <Calendar className="inline mr-1" size={16} />
                <strong>Next billing date:</strong> {formatDate(subscription.current_period_end)}
              </p>
              
              {subscription.cancel_at_period_end && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Your subscription will end on {formatDate(subscription.current_period_end)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center">
              {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                <button
                  onClick={handleCancel}
                  disabled={updating}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel Subscription
                </button>
              )}
              
              {subscription.cancel_at_period_end && (
                <button
                  onClick={handleReactivate}
                  disabled={updating}
                  className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  Reactivate Subscription
                </button>
              )}
              
              <button
                onClick={() => navigate('/account/billing')}
                className="mt-3 text-orange-600 hover:text-orange-700 font-medium"
              >
                <CreditCard className="inline mr-1" size={16} />
                Update Payment Method
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {subscription ? 'Change Your Plan' : 'Choose Your Subscription Plan'}
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg shadow-lg p-6 border-2 transition-all hover:shadow-xl ${
                plan.popular ? 'border-orange-500 scale-105' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-sm px-4 py-1 rounded-full font-medium">
                  Most Popular
                </span>
              )}
              
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-600 text-lg">/{plan.interval}</span>
                {plan.interval === 'year' && (
                  <div className="text-sm text-green-600 font-medium mt-1">Save 40% annually!</div>
                )}
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="text-green-500 mr-3 flex-shrink-0 mt-0.5" size={18} />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={updating || (subscription?.plan.name === plan.name && !subscription.cancel_at_period_end)}
                className={`w-full font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  plan.popular
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300'
                }`}
              >
                {subscription?.plan.name === plan.name && !subscription.cancel_at_period_end
                  ? 'Current Plan'
                  : subscription
                  ? 'Switch to This Plan'
                  : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mt-16 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-center mb-8">Why Subscribe to The Age Of GenZ?</h3>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-white" size={24} />
            </div>
            <h4 className="font-semibold mb-2">Independent Journalism</h4>
            <p className="text-gray-600 text-sm">No corporate influence, just authentic news and perspectives that matter to Gen Z</p>
          </div>
          <div>
            <div className="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-white" size={24} />
            </div>
            <h4 className="font-semibold mb-2">Daily Updates</h4>
            <p className="text-gray-600 text-sm">Stay informed with breaking news, analysis, and insights delivered fresh every day</p>
          </div>
          <div>
            <div className="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="text-white" size={24} />
            </div>
            <h4 className="font-semibold mb-2">Support the Mission</h4>
            <p className="text-gray-600 text-sm">Your subscription directly funds quality journalism and helps us grow our impact</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
        <h3 className="text-xl font-semibold mb-6 text-center">Frequently Asked Questions</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="font-medium text-gray-900 mb-2">Can I cancel anytime?</p>
            <p className="text-gray-600">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
          </div>
          <div>
            <p className="font-medium text-gray-900 mb-2">How do I update my payment method?</p>
            <p className="text-gray-600">Click on "Update Payment Method" in your subscription dashboard or go to your account billing settings.</p>
          </div>
          <div>
            <p className="font-medium text-gray-900 mb-2">What happens when I switch plans?</p>
            <p className="text-gray-600">When you switch plans, the change takes effect immediately and you'll be charged or credited the prorated difference.</p>
          </div>
          <div>
            <p className="font-medium text-gray-900 mb-2">Do you offer student discounts?</p>
            <p className="text-gray-600">Contact our support team with valid student ID for special pricing options available for students.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;