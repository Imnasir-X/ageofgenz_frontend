import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscribeToPlan } from '../utils/api';
import { loadStripe } from '@stripe/stripe-js';
import { Heart, Coffee, Sparkles, Zap, Shield } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

const DonationPlaceholder: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [donationType, setDonationType] = useState<'once' | 'monthly'>('once');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const { user, isAuthenticated } = useAuth();

  const amounts = [
    { value: 5, icon: Coffee, label: 'Coffee' },
    { value: 10, icon: Heart, label: 'Support', popular: true },
    { value: 25, icon: Sparkles, label: 'Power' },
    { value: 50, icon: Zap, label: 'Boost' },
  ];

  const handleDonate = async () => {
    const finalAmount = isCustom ? parseFloat(customAmount) : selectedAmount;
    
    if (!finalAmount || finalAmount < 1) {
      setError('Minimum $1 required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await subscribeToPlan(
        donationType === 'monthly' ? 'monthly_support' : 'one_time_donation',
        donationType,
        finalAmount
      );

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to initialize');

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: response.data.id
      });

      if (stripeError) throw stripeError;
    } catch (err: any) {
      setError(err.message || 'Payment failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const finalAmount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount;

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-4 text-white">
      <div className="text-center mb-4">
        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2">
          <Heart className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-lg mb-1">Support Us</h3>
        <p className="text-blue-100 text-xs">Help deliver fearless journalism</p>
      </div>

      {/* Optional login hint */}
      {!isAuthenticated && (
        <div className="mb-3 p-2 bg-white bg-opacity-10 rounded text-center">
          <p className="text-xs text-blue-100">
            <Link to="/login" className="text-white hover:underline">Login</Link> for supporter perks
          </p>
        </div>
      )}

      {/* Type Toggle */}
      <div className="flex rounded-lg bg-white bg-opacity-20 p-0.5 mb-3">
        <button
          onClick={() => setDonationType('once')}
          className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-all ${
            donationType === 'once' ? 'bg-white text-blue-600' : 'text-blue-100'
          }`}
        >
          One-time
        </button>
        <button
          onClick={() => setDonationType('monthly')}
          className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-all ${
            donationType === 'monthly' ? 'bg-white text-blue-600' : 'text-blue-100'
          }`}
        >
          Monthly ⭐
        </button>
      </div>

      {/* Amount Selection */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {amounts.map((amount) => {
          const Icon = amount.icon;
          return (
            <button
              key={amount.value}
              onClick={() => {
                setSelectedAmount(amount.value);
                setIsCustom(false);
                setCustomAmount('');
                setError('');
              }}
              className={`relative p-3 rounded-lg text-xs transition-all ${
                selectedAmount === amount.value && !isCustom
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'bg-white bg-opacity-20 hover:bg-opacity-30'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={12} />
                <span className="font-semibold">${amount.value}</span>
              </div>
              <div className={`text-xs ${
                selectedAmount === amount.value && !isCustom ? 'text-blue-500' : 'text-blue-200'
              }`}>
                {amount.label}
              </div>
              {amount.popular && (
                <div className="absolute -top-1 -right-1 bg-yellow-400 text-blue-900 text-xs px-1.5 py-0.5 rounded-full font-bold">
                  Popular
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Amount */}
      <div className="mb-3">
        <button
          onClick={() => {
            setIsCustom(true);
            setSelectedAmount(0);
            setError('');
          }}
          className={`w-full p-3 rounded-lg text-xs transition-all ${
            isCustom ? 'bg-white text-blue-600' : 'bg-white bg-opacity-20 hover:bg-opacity-30'
          }`}
        >
          Custom Amount
        </button>
        
        {isCustom && (
          <div className="mt-2 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 font-semibold">$</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              step="0.01"
              className="w-full pl-7 pr-3 py-2 bg-white text-blue-600 placeholder-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-white focus:ring-opacity-50"
            />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-3 p-2 bg-red-500 bg-opacity-20 border border-red-400 border-opacity-50 rounded-lg text-red-100 text-xs">
          {error}
        </div>
      )}

      {/* Donate Button */}
      <button
        onClick={handleDonate}
        disabled={loading || (!selectedAmount && !customAmount)}
        className="w-full bg-white text-blue-600 font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105 text-sm"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Heart size={16} />
            <span>
              Donate{' '}
              {finalAmount > 0 && `$${finalAmount}`}
              {donationType === 'monthly' && '/mo'}
            </span>
          </>
        )}
      </button>

      {/* Trust Footer */}
      <div className="mt-3 pt-3 border-t border-white border-opacity-20">
        <div className="flex items-center justify-center gap-4 text-xs text-blue-200">
          <div className="flex items-center gap-1">
            <Shield size={12} />
            <span>Secure</span>
          </div>
          <span>💳 All cards</span>
          <span>🏆 Tax deductible</span>
        </div>
        <p className="text-xs text-blue-300 text-center mt-1">
          Powered by Stripe
        </p>
      </div>
    </div>
  );
};

export default DonationPlaceholder;