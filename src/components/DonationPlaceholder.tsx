import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscribeToPlan } from '../utils/api';
import { loadStripe } from '@stripe/stripe-js';
import { Heart, Coffee, Sparkles, Zap, Shield, Star, Gift, Crown, Rocket } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

interface ParticleProps {
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
}

// Enhanced Floating Particle Component
const FloatingParticle: React.FC<ParticleProps> = ({ x, y, delay, duration, size }) => {
  const particleStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    width: `${size}px`,
    height: `${size}px`,
    background: `radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,180,100,0.6) 40%, rgba(255,120,50,0.3) 70%, transparent 100%)`,
    boxShadow: `0 0 ${size * 2}px rgba(255,150,80,0.4), inset 0 0 ${size}px rgba(255,255,255,0.3)`,
    borderRadius: '50%',
    animation: `float-${Math.random().toString(36).substr(2, 9)} ${duration}s ease-in-out ${delay}s infinite`,
    pointerEvents: 'none',
    filter: 'blur(0.5px)',
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

  // Enhanced amounts with better visual hierarchy
  const amounts = [
    { value: 5, icon: Coffee, label: 'Coffee', color: 'from-amber-400 to-orange-500', description: 'Buy us a coffee' },
    { value: 10, icon: Heart, label: 'Support', color: 'from-pink-400 to-red-500', popular: true, description: 'Show your love' },
    { value: 25, icon: Sparkles, label: 'Power', color: 'from-purple-400 to-indigo-500', description: 'Power our work' },
    { value: 50, icon: Zap, label: 'Boost', color: 'from-yellow-400 to-orange-500', description: 'Supercharge us' },
  ];

  // Generate more particles for premium feel
  useEffect(() => {
    const generateParticles = () => {
      const isMobile = window.innerWidth < 768;
      const particleCount = isMobile ? 8 : 18;
      
      return Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: i * 0.3,
        duration: 12 + Math.random() * 8,
        size: 3 + Math.random() * 8,
      }));
    };

    setParticles(generateParticles());

    // Enhanced keyframes for smoother animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float-enhanced {
        0%, 100% {
          transform: translateY(0) translateX(0) scale(0.8) rotate(0deg);
          opacity: 0;
        }
        15% {
          opacity: 0.9;
          transform: translateY(-10px) translateX(10px) scale(1) rotate(45deg);
        }
        50% {
          transform: translateY(-40px) translateX(25px) scale(1.2) rotate(180deg);
          opacity: 0.7;
        }
        85% {
          opacity: 0.9;
          transform: translateY(-20px) translateX(15px) scale(0.9) rotate(270deg);
        }
      }
      
      @keyframes pulse-glow {
        0%, 100% {
          box-shadow: 0 0 20px rgba(255, 150, 100, 0.3);
        }
        50% {
          box-shadow: 0 0 40px rgba(255, 150, 100, 0.6), 0 0 60px rgba(255, 100, 50, 0.3);
        }
      }
      
      @keyframes slide-shine {
        0% {
          transform: translateX(-100%) skew(-20deg);
        }
        100% {
          transform: translateX(300%) skew(-20deg);
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

  // Enhanced container styles
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 25%, #7c3aed 50%, #c026d3 75%, #ea580c 100%)',
    borderRadius: '1rem',
    padding: '1.5rem',
    color: 'white',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
  };



  const glassStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.12)',
  };

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(255, 150, 100, 0.3); }
            50% { box-shadow: 0 0 40px rgba(255, 150, 100, 0.6), 0 0 60px rgba(255, 100, 50, 0.3); }
          }
          
          .amount-card {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
          }
          
          .amount-card::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
            transform: translateX(-100%);
            transition: transform 0.6s ease;
          }
          
          .amount-card:hover::before {
            transform: translateX(100%);
          }
          
          .amount-card:hover {
            transform: translateY(-4px) scale(1.05);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          }
          
          .amount-card.selected {
            transform: scale(1.08) translateY(-2px);
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.5), 0 20px 40px rgba(0, 0, 0, 0.3);
            animation: pulse-glow 2s ease-in-out infinite;
          }
          
          .glow-button {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
            background: linear-gradient(45deg, #ffffff, #f8fafc, #ffffff);
          }
          
          .glow-button::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.4), transparent);
            transform: translateX(-100%);
            transition: transform 0.6s ease;
          }
          
          .glow-button:hover:not(:disabled)::before {
            transform: translateX(100%);
          }
          
          .glow-button:hover:not(:disabled) {
            box-shadow: 
              0 0 30px rgba(255, 150, 100, 0.6),
              0 10px 30px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
          }
          
          .donation-type-toggle {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.15);
          }
          
          .input-glow:focus {
            box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2), 0 0 20px rgba(255, 150, 100, 0.3);
          }
          
          .popular-badge {
            background: linear-gradient(45deg, #fbbf24, #f59e0b, #d97706);
            animation: pulse-glow 3s ease-in-out infinite;
          }
        `}
      </style>

      {/* Enhanced Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <FloatingParticle key={particle.id} {...particle} />
        ))}
      </div>



      {/* Premium Border Glow */}
      <div className="absolute inset-0 rounded-2xl" style={{
        background: 'linear-gradient(45deg, rgba(255,255,255,0.1), transparent, rgba(255,255,255,0.1))',
        padding: '1px',
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
      }} />

      {/* Main Content */}
      <div className="relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-6">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 relative"
            style={glassStyle}
          >
            <Heart className="w-7 h-7 text-pink-300" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
          </div>
          <h3 className="font-bold text-xl mb-2 bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
            Support The Age of GenZ
          </h3>
          <p className="text-orange-100 text-sm font-medium">Help us deliver fearless, independent journalism</p>
        </div>

        {/* Enhanced Login Hint */}
        {!isAuthenticated && (
          <div className="mb-4 p-3 rounded-xl relative" style={glassStyle}>
            <div className="flex items-center justify-center gap-2">
              <Crown className="w-4 h-4 text-yellow-300" />
              <p className="text-sm text-orange-100">
                <Link to="/login" className="text-white hover:text-yellow-300 font-semibold transition-colors duration-300">
                  Login
                </Link> 
                <span className="text-orange-200"> for exclusive supporter perks</span>
              </p>
            </div>
          </div>
        )}

        {/* Enhanced Type Toggle */}
        <div className="donation-type-toggle flex rounded-xl p-1 mb-5">
          <button
            onClick={() => setDonationType('once')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              donationType === 'once' 
                ? 'bg-white text-purple-700 shadow-xl transform scale-105' 
                : 'text-orange-100 hover:text-white hover:bg-white hover:bg-opacity-10'
            }`}
          >
            <Gift size={16} />
            One-time
          </button>
          <button
            onClick={() => setDonationType('monthly')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              donationType === 'monthly' 
                ? 'bg-white text-purple-700 shadow-xl transform scale-105' 
                : 'text-orange-100 hover:text-white hover:bg-white hover:bg-opacity-10'
            }`}
          >
            <Rocket size={16} />
            Monthly
            <Star size={14} className="text-yellow-500" />
          </button>
        </div>

        {/* Enhanced Amount Selection */}
        <div className="grid grid-cols-2 gap-3 mb-5">
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
                className={`amount-card relative p-4 rounded-xl text-sm group ${
                  isSelected ? 'selected' : ''
                }`}
                style={isSelected ? { 
                  background: 'linear-gradient(45deg, #ffffff, #f8fafc)',
                  color: '#7c3aed' 
                } : glassStyle}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-purple-100' : 'bg-white bg-opacity-20'}`}>
                      <Icon size={14} className={isSelected ? 'text-purple-600' : 'text-white'} />
                    </div>
                    <span className="font-bold text-lg">${amount.value}</span>
                  </div>
                  {amount.popular && (
                    <div className="popular-badge text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg flex items-center gap-1">
                      <Star size={10} />
                      Popular
                    </div>
                  )}
                </div>
                <div className={`text-xs font-medium ${
                  isSelected ? 'text-purple-600' : 'text-orange-200'
                }`}>
                  {amount.label}
                </div>
                <div className={`text-xs mt-1 ${
                  isSelected ? 'text-purple-500' : 'text-orange-300'
                }`}>
                  {amount.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Enhanced Custom Amount */}
        <div className="mb-5">
          <button
            onClick={() => {
              setIsCustom(true);
              setSelectedAmount(0);
              setError('');
            }}
            className={`amount-card w-full p-4 rounded-xl text-sm ${
              isCustom ? 'selected' : ''
            }`}
            style={isCustom ? { 
              background: 'linear-gradient(45deg, #ffffff, #f8fafc)',
              color: '#7c3aed' 
            } : glassStyle}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isCustom ? 'bg-purple-100' : 'bg-white bg-opacity-20'}`}>
                <Sparkles size={16} className={isCustom ? 'text-purple-600' : 'text-white'} />
              </div>
              <div className="text-left">
                <div className="font-semibold">Custom Amount</div>
                <div className={`text-xs ${isCustom ? 'text-purple-500' : 'text-orange-200'}`}>
                  Choose your own amount
                </div>
              </div>
            </div>
          </button>
          
          {isCustom && (
            <div className="mt-3 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600 font-bold text-lg">$</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                step="0.01"
                className="input-glow w-full pl-10 pr-4 py-3 bg-white text-purple-700 placeholder-purple-400 rounded-xl text-lg font-semibold focus:ring-0 focus:outline-none transition-all duration-300"
              />
            </div>
          )}
        </div>

        {/* Enhanced Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-400 border-opacity-50 rounded-xl text-red-100 text-sm backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              {error}
            </div>
          </div>
        )}

        {/* Enhanced Donate Button */}
        <button
          onClick={handleDonate}
          disabled={loading || (!selectedAmount && !customAmount)}
          className="glow-button w-full text-purple-700 font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-xl"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <Heart size={20} className="text-pink-600" />
              <span>
                Donate{' '}
                {finalAmount > 0 && `$${finalAmount}`}
                {donationType === 'monthly' && '/month'}
              </span>
              <Zap size={18} className="text-yellow-600" />
            </>
          )}
        </button>

        {/* Enhanced Trust Footer */}
        <div className="mt-5 pt-4 border-t border-white border-opacity-20">
          <div className="flex items-center justify-center gap-6 text-sm text-orange-200 mb-2">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-green-400" />
              <span>SSL Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              <span>All Cards</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
              <span>Tax Deductible</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-orange-300 flex items-center justify-center gap-2">
              <span>Powered by</span>
              <span className="font-semibold text-white">Stripe</span>
              <div className="w-1 h-1 bg-orange-300 rounded-full"></div>
              <span>256-bit encryption</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationPlaceholder;