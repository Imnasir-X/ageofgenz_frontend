import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscribeToPlan } from '../utils/api';
import { loadStripe } from '@stripe/stripe-js';
import { Heart, Coffee, Sparkles, Zap, Shield, RefreshCcw } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

interface ParticleProps {
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
}

// Floating Particle Component
const FloatingParticle: React.FC<ParticleProps> = ({ x, y, delay, duration, size }) => {
  const particleStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    width: `${size}px`,
    height: `${size}px`,
    background: `radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,200,150,0.4) 50%, transparent 70%)`,
    boxShadow: `0 0 ${size}px rgba(255,200,150,0.6)`,
    borderRadius: '50%',
    animation: `float-${Math.random().toString(36).substr(2, 9)} ${duration}s ease-in-out ${delay}s infinite`,
    pointerEvents: 'none',
  };

  return <div style={particleStyle} />;
};

const DonationPlaceholder: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [donationType, setDonationType] = useState<'once' | 'monthly'>('once');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    delay: number;
    duration: number;
    size: number;
  }>>([]);
  
  const { user, isAuthenticated } = useAuth();

  const amounts = [
    { value: 5, icon: Coffee, label: 'Coffee' },
    { value: 10, icon: Heart, label: 'Support', popular: true },
    { value: 25, icon: Sparkles, label: 'Power' },
    { value: 50, icon: Zap, label: 'Boost' },
  ];

  // Pre-generate particles on mount with responsive count
  useEffect(() => {
    const generateParticles = () => {
      const isMobile = window.innerWidth < 768;
      const particleCount = isMobile ? 5 : 12;
      
      return Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: i * 0.5,
        duration: 15 + Math.random() * 10,
        size: 4 + Math.random() * 6,
      }));
    };

    setParticles(generateParticles());

    // Create dynamic keyframes for particles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float-animation {
        0%, 100% {
          transform: translateY(0) translateX(0) scale(1);
          opacity: 0;
        }
        10% {
          opacity: 0.8;
        }
        50% {
          transform: translateY(-30px) translateX(20px) scale(1.1);
          opacity: 0.6;
        }
        90% {
          opacity: 0.8;
        }
      }
    `;
    document.head.appendChild(style);

    const handleResize = () => {
      setParticles(generateParticles());
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.head.removeChild(style);
    };
  }, []);

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

  // Component styles
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    borderRadius: '0.85rem',
    padding: 'clamp(1.25rem, 3vw, 2rem)',
    color: 'white',
    overflow: 'hidden',
    maxWidth: '24rem',
    width: '100%',
    margin: '0 auto',
    boxShadow: '0 12px 30px rgba(234, 88, 12, 0.25)',
  };

  const glassStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.14)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
  };

  return (
    <div style={containerStyle}>
      <style>
        {`
          .amount-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .amount-card:hover {
            transform: translateY(-2px) scale(1.02);
          }
          
          .amount-card.selected {
            transform: scale(1.05);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
          }
          
          .glow-button {
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          
          .glow-button:hover:not(:disabled) {
            box-shadow: 0 0 25px rgba(255, 150, 100, 0.5);
            transform: translateY(-1px);
          }
          
          .glow-button:hover:not(:disabled)::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            animation: slide 0.5s ease-in-out;
          }
          
          @keyframes slide {
            from { left: -100%; }
            to { left: 100%; }
          }
        `}
      </style>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <FloatingParticle key={particle.id} {...particle} />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <div className="text-center mb-4">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2"
            style={glassStyle}
          >
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg mb-1">Support Us</h3>
          <p className="text-sm text-white/80">Help deliver fearless journalism</p>
        </div>

        {/* Optional login hint */}
        {!isAuthenticated && (
          <div className="mb-3 p-2 rounded text-center" style={glassStyle}>
            <p className="text-sm text-white/80">
              <Link to="/login" className="text-white hover:underline font-semibold">Login</Link> for supporter perks
            </p>
          </div>
        )}

        {/* Type Toggle */}
        <div className="flex rounded-lg p-0.5 mb-3" style={glassStyle}>
          <button
            onClick={() => setDonationType('once')}
            className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all ${
              donationType === 'once' 
                ? 'bg-white text-orange-600 shadow-lg' 
                : 'text-white/80 hover:text-white'
            }`}
          >
            <span className="inline-flex items-center justify-center gap-1.5">
              <Heart size={14} />
              <span>One-time</span>
            </span>
          </button>
          <button
            onClick={() => setDonationType('monthly')}
            className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all ${
              donationType === 'monthly' 
                ? 'bg-white text-orange-600 shadow-lg' 
                : 'text-white/80 hover:text-white'
            }`}
          >
            <span className="inline-flex items-center justify-center gap-1.5">
              <RefreshCcw size={14} />
              <span>Monthly</span>
            </span>
          </button>
        </div>

        {/* Amount Selection */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {amounts.map((amount) => {
            const Icon = amount.icon;
            const isSelected = selectedAmount === amount.value && !isCustom;
            
            return (
              <button
                key={amount.value}
                onClick={() => {
                  setSelectedAmount(amount.value);
                  setIsCustom(false);
                  setCustomAmount('');
                  setError('');
                }}
                className={`amount-card relative p-3 rounded-xl text-sm ${
                  isSelected ? 'selected' : ''
                }`}
                style={isSelected ? { background: 'white', color: '#ea580c' } : glassStyle}
              >
                <div className="flex items-center gap-2 mb-1 text-base">
                  <Icon size={14} />
                  <span className="font-semibold">${amount.value}</span>
                </div>
                <div className={`text-xs ${
                  isSelected ? 'text-orange-600' : 'text-white/80'
                }`}>
                  {amount.label}
                </div>
                {amount.popular && (
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
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
            className={`amount-card w-full p-3 rounded-xl text-sm ${
              isCustom ? 'selected' : ''
            }`}
            style={isCustom ? { background: 'white', color: '#ea580c' } : glassStyle}
          >
            Custom Amount
          </button>
          
          {isCustom && (
            <div className="mt-2 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-600 font-semibold">$</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                step="0.01"
                className="w-full pl-7 pr-3 py-2 bg-orange-50 text-orange-700 placeholder-orange-500 rounded-lg text-sm border border-orange-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
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
          className="glow-button w-full bg-white text-orange-600 font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
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
          <div className="flex items-center justify-center gap-4 text-xs text-orange-200">
            <div className="flex items-center gap-1">
              <Shield size={12} />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              <span>All cards</span>
            </div>
            <div className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
              <span>Tax deductible</span>
            </div>
          </div>
          <p className="text-xs text-orange-300 text-center mt-1">
            Powered by Stripe
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonationPlaceholder;

