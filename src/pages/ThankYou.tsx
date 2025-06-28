import React from 'react';
import { Link } from 'react-router-dom';

const ThankYou: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <section className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Thank You, Gen Z Legend!
          </h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            Your donation means the world to us. You’re helping keep The Age of GenZ alive, delivering dope journalism 
            for our generation. We’re beyond grateful for your support!
          </p>
        </section>

        <div className="bg-gray-900 rounded border border-gray-800 p-6 shadow-lg max-w-md mx-auto">
          <div className="flex flex-col gap-3">
            <Link
              to="/"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded transition-colors"
            >
              Return to Home
            </Link>
            <Link
              to="/contact"
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;