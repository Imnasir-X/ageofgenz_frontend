import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, CheckCircle, Star, Share2, Twitter, Facebook, Copy, Home, FileText, MessageCircle } from 'lucide-react';

const ThankYou: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const sessionId = searchParams.get('session_id');
  
  // Confetti effect particles
  const [confetti, setConfetti] = useState<Array<{
    id: number;
    x: number;
    delay: number;
    color: string;
  }>>([]);

  useEffect(() => {
    // Generate confetti particles
    const colors = ['#f97316', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444'];
    const particles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setConfetti(particles);
  }, []);

  const handleShare = async (platform: string) => {
    const shareText = "I just supported The Age of GenZ - independent journalism for our generation!";
    const shareUrl = "https://theageofgenz.com";
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-purple-50 py-8 relative overflow-hidden">
      {/* Confetti Animation */}
      <style>
        {`
          @keyframes confetti-fall {
            0% {
              transform: translateY(-100vh) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }
          
          .confetti-particle {
            animation: confetti-fall 3s ease-in-out infinite;
          }
          
          @keyframes pulse-success {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          
          .pulse-success {
            animation: pulse-success 2s ease-in-out infinite;
          }
          
          @keyframes float-up {
            0% { transform: translateY(20px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          
          .float-up {
            animation: float-up 0.8s ease-out forwards;
          }
        `}
      </style>

      {/* Confetti Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {confetti.map((particle) => (
          <div
            key={particle.id}
            className="confetti-particle absolute w-3 h-3 rounded"
            style={{
              left: `${particle.x}%`,
              backgroundColor: particle.color,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Success Header */}
        <section className="mb-8 text-center float-up">
          <div className="pulse-success inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Thank You, Gen Z Legend!
          </h1>
          
          <p className="text-gray-700 text-lg max-w-2xl mx-auto leading-relaxed">
            Your donation means the world to us! You're helping keep <span className="font-semibold text-orange-600">The Age of GenZ</span> alive, 
            delivering fearless journalism for our generation. We're beyond grateful for your support! 
          </p>
          
          {sessionId && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Payment Confirmed • Session: {sessionId.slice(-8)}
            </div>
          )}
        </section>

        {/* Impact Section */}
        <section className="mb-8 float-up" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center gap-2">
              <Star className="w-6 h-6 text-orange-500" />
              Your Impact in Action
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Independent Journalism</h3>
                <p className="text-sm text-gray-600">Supporting unbiased reporting free from corporate influence</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Quality Content</h3>
                <p className="text-sm text-gray-600">Enabling deeper investigations and better storytelling</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Gen Z Voice</h3>
                <p className="text-sm text-gray-600">Amplifying stories that matter to our generation</p>
              </div>
            </div>
          </div>
        </section>

        {/* Share Section */}
        <section className="mb-8 float-up" style={{ animationDelay: '0.4s' }}>
          <div className="bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
              <Share2 className="w-6 h-6" />
              Spread the Word!
            </h2>
            <p className="mb-6 text-orange-100">
              Help us grow by sharing your support with friends who care about independent journalism!
            </p>
            
            <div className="flex justify-center gap-4 flex-wrap">
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm px-4 py-2 rounded-lg transition-all"
              >
                <Twitter className="w-4 h-4" />
                Share on X
              </button>
              
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm px-4 py-2 rounded-lg transition-all"
              >
                <Facebook className="w-4 h-4" />
                Share on Facebook
              </button>
              
              <button
                onClick={() => handleShare('copy')}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm px-4 py-2 rounded-lg transition-all"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="float-up" style={{ animationDelay: '0.6s' }}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-md mx-auto">
            <div className="flex flex-col gap-3">
              <Link
                to="/"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105 text-center shadow-lg flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Return to Home
              </Link>
              
              <Link
                to="/articles"
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105 text-center shadow-lg flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Read Latest Articles
              </Link>
              
              <Link
                to="/contact"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl transition-all text-center border border-gray-300 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Contact Us
              </Link>
            </div>
          </div>
        </section>

        {/* Footer Message */}
        <div className="text-center mt-8 float-up" style={{ animationDelay: '0.8s' }}>
          <p className="text-gray-600 text-sm">
            Follow us for updates: 
            <a href="#" className="text-orange-600 hover:text-orange-700 font-medium ml-1">@theageofgenz</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;