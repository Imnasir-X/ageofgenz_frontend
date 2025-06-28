import React from 'react';
import { Link } from 'react-router-dom';

const Cancel: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <section className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Donation Canceled
          </h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            No worries—things happen. If you changed your mind or hit a snag, we’re still cool. Want to try again or 
            chat with us? We’re here for you.
          </p>
        </section>

        <div className="bg-gray-900 rounded border border-gray-800 p-6 shadow-lg max-w-md mx-auto">
          <div className="flex flex-col gap-3">
            <Link
              to="/donate"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded transition-colors"
            >
              Try Donating Again
            </Link>
            <Link
              to="/contact"
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded transition-colors"
            >
              Contact Us
            </Link>
            <Link
              to="/"
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cancel;