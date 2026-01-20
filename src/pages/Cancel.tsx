import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { XCircle, Heart, ArrowLeft, MessageCircle, RefreshCw, Home, Share2, Users, Bell, Mail } from 'lucide-react';

const Cancel: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Floating particles for visual interest
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    const generateParticles = () => {
      return Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: i * 0.3,
      }));
    };
    
    setParticles(generateParticles());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-orange-50 py-8 relative overflow-hidden">
      <style>
        {`
          @keyframes float-gentle {
            0%, 100% {
              transform: translateY(0) rotate(0deg);
              opacity: 0.3;
            }
            50% {
              transform: translateY(-20px) rotate(180deg);
              opacity: 0.6;
            }
          }
          
          .float-particle {
            animation: float-gentle 6s ease-in-out infinite;
          }
          
          @keyframes slide-up {
            0% {
              transform: translateY(30px);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          .slide-up {
            animation: slide-up 0.8s ease-out forwards;
          }
          
          @keyframes gentle-bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          .gentle-bounce {
            animation: gentle-bounce 3s ease-in-out infinite;
          }
        `}
      </style>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="float-particle absolute w-2 h-2 bg-orange-300 rounded-full opacity-30"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Header Section */}
        <section className={`mb-8 text-center ${mounted ? 'slide-up' : 'opacity-0'}`}>
          <div className="gentle-bounce inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <XCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
            Payment Canceled
          </h1>
          
          <p className="text-gray-700 text-lg max-w-2xl mx-auto leading-relaxed">
            No worries, things happen! If you changed your mind or hit a snag, we're still cool. 
            Want to try again or chat with us? We're here for you, no judgment! 
          </p>
        </section>

        {/* Reassurance Section */}
        <section className={`mb-8 ${mounted ? 'slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center gap-2">
              <Heart className="w-6 h-6 text-blue-500" />
              We Totally Get It
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">No Pressure</h3>
                <p className="text-sm text-gray-600">Donate when you're ready, we're not going anywhere</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Questions?</h3>
                <p className="text-sm text-gray-600">Hit us up if something went wrong or you need help</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <RefreshCw className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Try Again</h3>
                <p className="text-sm text-gray-600">Ready to support? The donation page is just a click away</p>
              </div>
            </div>
          </div>
        </section>

        {/* Alternative Support Section */}
        <section className={`mb-8 ${mounted ? 'slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
          <div className="bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
              <Share2 className="w-6 h-6" />
              Other Ways to Support Us
            </h2>
            <p className="mb-6 text-orange-100">
              Can't donate right now? No worries! There are tons of other ways to help us grow:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Share2 className="w-5 h-5" />
                  <h3 className="font-bold">Share Our Stories</h3>
                </div>
                <p className="text-sm text-orange-100">Forward articles to friends, share on social media</p>
              </div>
              
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-5 h-5" />
                  <h3 className="font-bold">Engage With Us</h3>
                </div>
                <p className="text-sm text-orange-100">Comment, like, and join our conversations</p>
              </div>
              
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5" />
                  <h3 className="font-bold">Spread the Word</h3>
                </div>
                <p className="text-sm text-orange-100">Tell friends about independent journalism</p>
              </div>
              
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-5 h-5" />
                  <h3 className="font-bold">Stay Updated</h3>
                </div>
                <p className="text-sm text-orange-100">Follow us for the latest Gen Z news and insights</p>
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className={`${mounted ? 'slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-md mx-auto">
            <div className="flex flex-col gap-3">
              <Link
                to="/donate"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105 text-center shadow-lg flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5" />
                Try Donating Again
              </Link>
              
              <Link
                to="/"
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105 text-center shadow-lg flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Reading
              </Link>
              
              <Link
                to="/contact"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl transition-all text-center border border-gray-300 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Contact Support
              </Link>
              
              <Link
                to="/"
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-4 rounded-xl transition-all text-center border border-gray-200 flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Return to Home
              </Link>
            </div>
          </div>
        </section>

        {/* Footer Message */}
        <div className={`text-center mt-8 ${mounted ? 'slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
          <p className="text-gray-600 text-sm">
            Thanks for considering supporting independent journalism.
            {' '}
            <a href="https://www.instagram.com/theageofgenz" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 font-medium ml-1">@theageofgenz</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cancel;
