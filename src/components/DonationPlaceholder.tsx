import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscribeToPlan } from '../utils/api';
import { loadStripe } from '@stripe/stripe-js';
import { Heart, CreditCard, Check, Coffee, Sparkles, Shield, Star, Zap } from 'lucide-react';

// Initialize Stripe - replace with your actual publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

interface DonationOption {
  amount: number;
  label: string;
  icon: React.ElementType;
  description: string;
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
    { 
      amount: 5, 
      label: '$5', 
      icon: Coffee, 
      description: 'Buy us coffee'
    },
    { 
      amount: 10, 
      label: '$10', 
      icon: Heart, 
      description: 'Show support', 
      popular: true 
    },
    { 
      amount: 25, 
      label: '$25', 
      icon: Sparkles, 
      description: 'Power our work'
    },
    { 
      amount: 50, 
      label: '$50', 
      icon: Zap, 
      description: 'Supercharge us'
    },
  ];

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
    setError('');
  };

  const handleCustomAmount = () => {
    setIsCustom(true);
    setSelectedAmount(0);
    setError('');
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

  const finalAmount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount;
  const selectedOption = donationOptions.find(opt => opt.amount === selectedAmount);

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full translate-y-12 -translate-x-12"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">Support Our Work</h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Help us deliver fearless journalism for the next generation.
          </p>
        </div>

        {/* Donation Type Toggle */}
        <div className="flex rounded-xl bg-white bg-opacity-20 p-1 mb-6">
          <button
            onClick={() => setDonationType('once')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              donationType === 'once'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            One-time
          </button>
          <button
            onClick={() => setDonationType('monthly')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all relative ${
              donationType === 'monthly'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            Monthly
            <Star size={12} className="absolute -top-1 -right-1 text-yellow-400" />
          </button>
        </div>

        {/* Amount Selection */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {donationOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.amount}
                onClick={() => handleAmountSelect(option.amount)}
                className={`relative p-4 rounded-xl font-medium transition-all text-left ${
                  selectedAmount === option.amount && !isCustom
                    ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30 border border-white border-opacity-20'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <IconComponent size={16} />
                  <span className="font-semibold">{option.label}</span>
                </div>
                <div className={`text-xs ${
                  selectedAmount === option.amount && !isCustom ? 'text-blue-500' : 'text-blue-200'
                }`}>
                  {option.description}
                </div>
                {option.popular && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-blue-900 text-xs px-2 py-0.5 rounded-full font-semibold">
                    Popular
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Amount */}
        <div className="mb-6">
          <button
            onClick={handleCustomAmount}
            className={`w-full p-4 rounded-xl font-medium transition-all text-left ${
              isCustom
                ? 'bg-white text-blue-600 shadow-lg'
                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30 border border-white border-opacity-20'
            }`}
          >
            <div className="flex items-center gap-2">
              <CreditCard size={16} />
              <span>Custom Amount</span>
            </div>
          </button>
          
          {isCustom && (
            <div className="mt-3">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 font-semibold">$</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 bg-white text-blue-600 placeholder-blue-300 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Benefits for Monthly */}
        {donationType === 'monthly' && (
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white border-opacity-30">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Star size={16} className="text-yellow-400" />
              Monthly Supporter Perks:
            </h4>
            <ul className="space-y-2 text-sm text-blue-100">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-green-400 flex-shrink-0" />
                Ad-free reading experience
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-green-400 flex-shrink-0" />
                Exclusive newsletter content
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-green-400 flex-shrink-0" />
                Early access to new features
              </li>
            </ul>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-400 border-opacity-50 rounded-xl text-red-100 text-sm backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Donate Button */}
        <button
          onClick={handleDonate}
          disabled={loading || (!selectedAmount && !customAmount)}
          className="w-full bg-white text-blue-600 font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105 transform"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Heart size={20} />
              <span>
                {!isAuthenticated ? 'Login & ' : ''}Donate{' '}
                {finalAmount > 0 && `$${finalAmount}`}
                {donationType === 'monthly' && '/month'}
              </span>
            </>
          )}
        </button>

        {/* Trust Indicators */}
        <div className="mt-4 pt-4 border-t border-white border-opacity-20">
          <div className="flex items-center justify-between text-xs text-blue-200">
            <div className="flex items-center gap-2">
              <Shield size={14} />
              <span>Secure payment</span>
            </div>
            <div className="flex items-center gap-4">
              <span>💳 All cards</span>
              <span>🏆 Tax deductible</span>
            </div>
          </div>
          <p className="text-xs text-blue-300 text-center mt-2">
            Powered by Stripe • Your payment info is never stored
          </p>
        </div>

        {/* Current selection summary */}
        {(selectedAmount > 0 || (isCustom && customAmount)) && (
          <div className="mt-4 p-3 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-200">Your contribution:</span>
              <div className="text-right">
                <div className="font-semibold text-white">
                  ${finalAmount}{donationType === 'monthly' ? '/month' : ''}
                </div>
                {selectedOption && (
                  <div className="text-xs text-blue-200">{selectedOption.description}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationComponent;