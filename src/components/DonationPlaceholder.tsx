import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscribeToPlan } from '../utils/api';
import { loadStripe } from '@stripe/stripe-js';
import { Heart, CreditCard, Check } from 'lucide-react';

// Initialize Stripe - replace with your actual publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

interface DonationOption {
  amount: number;
  label: string;
  popular?: boolean;
}

const DonationComponent: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [donationType, setDonationType] = useState<'once' | 'monthly'>('once');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const donationOptions: DonationOption[] = [
    { amount: 5, label: '$5' },
    { amount: 10, label: '$10', popular: true },
    { amount: 25, label: '$25' },
    { amount: 50, label: '$50' },
  ];

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomAmount = () => {
    setIsCustom(true);
    setSelectedAmount(0);
  };

  const handleDonate = async () => {
    if (!isAuthenticated) {
      // Save donation intent and redirect to login
      sessionStorage.setItem('donationIntent', JSON.stringify({
        amount: isCustom ? parseFloat(customAmount) : selectedAmount,
        type: donationType
      }));
      navigate('/login');
      return;
    }

    const finalAmount = isCustom ? parseFloat(customAmount) : selectedAmount;
    
    if (!finalAmount || finalAmount < 1) {
      setError('Please enter a valid amount (minimum $1)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create subscription/donation session
      const response = await subscribeToPlan(
        donationType === 'monthly' ? 'monthly_support' : 'one_time_donation',
        donationType,
        finalAmount
      );

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      // Redirect to Stripe Checkout
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: response.data.id
      });

      if (stripeError) {
        throw stripeError;
      }
    } catch (err: any) {
      console.error('Donation error:', err);
      setError(err.message || 'Failed to process donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <Heart className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Support Our Journalism</h2>
        <p className="text-gray-600">
          Your contribution fuels fearless journalism for the next generation..
        </p>
      </div>

      {/* Donation Type Toggle */}
      <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
        <button
          onClick={() => setDonationType('once')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            donationType === 'once'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          One-time
        </button>
        <button
          onClick={() => setDonationType('monthly')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            donationType === 'monthly'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Monthly
        </button>
      </div>

      {/* Amount Selection */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {donationOptions.map((option) => (
          <button
            key={option.amount}
            onClick={() => handleAmountSelect(option.amount)}
            className={`relative py-3 px-4 rounded-lg font-medium transition-all ${
              selectedAmount === option.amount && !isCustom
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
            {option.popular && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                Popular
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Custom Amount */}
      <div className="mb-6">
        <button
          onClick={handleCustomAmount}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
            isCustom
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Other Amount
        </button>
        
        {isCustom && (
          <div className="mt-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                step="0.01"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Benefits */}
      {donationType === 'monthly' && (
        <div className="bg-orange-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">Monthly Supporter Benefits:</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li className="flex items-center">
              <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
              Ad-free reading experience
            </li>
            <li className="flex items-center">
              <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
              Exclusive newsletter content
            </li>
            <li className="flex items-center">
              <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
              Early access to new features
            </li>
          </ul>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Donate Button */}
      <button
        onClick={handleDonate}
        disabled={loading || (!selectedAmount && !customAmount)}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard size={20} className="mr-2" />
            Donate {isCustom && customAmount ? `$${customAmount}` : selectedAmount ? `$${selectedAmount}` : ''} 
            {donationType === 'monthly' ? '/month' : ''}
          </>
        )}
      </button>

      {/* Security Note */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Secure payment powered by Stripe. Your payment info is never stored on our servers.
      </p>
    </div>
  );
};

export default DonationComponent;