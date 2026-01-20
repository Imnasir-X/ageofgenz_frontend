import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Helmet>
        <title>About Us - The Age Of GenZ | Professional News Organization</title>
        <meta name="description" content="Learn about The Age Of GenZ - a professional news organization delivering NEWS YOU CAN VIBE WITH. Founded by Nasir Khan, serving global audiences with unbiased journalism." />
        <meta name="keywords" content="about The Age Of GenZ, news organization, professional journalism, Nasir Khan founder, NEWS YOU CAN VIBE WITH" />
      </Helmet>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About The Age Of GenZ
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            <span className="text-orange-500 font-semibold">"NEWS YOU CAN VIBE WITH"</span> &mdash;
            A professional news organization delivering credible journalism for all generations
          </p>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Our Story */}
            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-orange-500 pb-3">
                Our Story
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="text-lg leading-relaxed mb-6">
                  Founded in 2025 by <strong>Nasir Khan</strong>, a Computer Science graduate from East West University, and <strong>Imran Khan</strong>, an IT scholar at ULAB University in Finland, 
                  <strong> The Age Of GenZ</strong> emerged from a vision to bridge generational gaps in news consumption. 
                  We recognized that modern audiences&mdash;from Gen Z to Baby Boomers&mdash;deserve news that speaks their language 
                  while maintaining the highest standards of journalistic integrity.
                </p>
                <p className="text-lg leading-relaxed mb-6">
                  Based in <strong>Dhaka, Bangladesh</strong>, we serve a global audience across the 
                  <strong> United States, Europe, and Asia</strong>, delivering comprehensive coverage that spans 
                  politics, culture, technology, world events, and beyond. Our unique approach combines traditional 
                  journalism values with digital-native storytelling techniques.
                </p>
                <p className="text-lg leading-relaxed">
                  What started as an ambitious project has evolved into a trusted news platform that publishes 
                  3-4 carefully curated articles every day, each crafted to inform, engage, and inspire our diverse readership.
                </p>
              </div>
            </section>

            {/* Mission & Vision */}
            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-orange-500 pb-3">
                Mission & Vision
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Our Mission</h3>
                  <p className="text-gray-700 leading-relaxed">
                    To deliver professional, unbiased journalism that resonates across all generations. 
                    We democratize access to quality news, ensuring every reader&mdash;regardless of age or 
                    background&mdash;can stay informed about the issues that shape our world.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Our Vision</h3>
                  <p className="text-gray-700 leading-relaxed">
                    To become a globally recognized news organization that sets the standard for 
                    cross-generational journalism, fostering informed communities and promoting 
                    understanding across diverse perspectives and cultures.
                  </p>
                </div>
              </div>
            </section>

            {/* Editorial Standards */}
            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-orange-500 pb-3">
                Editorial Standards
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mt-1">
                      <span className="text-white text-sm font-bold">&#10003;</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">Neutrality Policy</h4>
                      <p className="text-gray-600 text-sm">Unbiased reporting across all political and social spectrums</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mt-1">
                      <span className="text-white text-sm font-bold">&#10003;</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">Fact-First Approach</h4>
                      <p className="text-gray-600 text-sm">Rigorous verification before publication</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mt-1">
                      <span className="text-white text-sm font-bold">&#10003;</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">Source Transparency</h4>
                      <p className="text-gray-600 text-sm">Clear attribution and credible sourcing</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mt-1">
                      <span className="text-white text-sm font-bold">&#10003;</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">Ethical Journalism</h4>
                      <p className="text-gray-600 text-sm">Adhering to international journalism standards</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Facts */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Quick Facts</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Founded:</span>
                  <span className="font-semibold">2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Headquarters:</span>
                  <span className="font-semibold">Dhaka, Bangladesh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Coverage Area:</span>
                  <span className="font-semibold">Global</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Target Demographics:</span>
                  <span className="font-semibold">Ages 18-35+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Publishing Frequency:</span>
                  <span className="font-semibold">3-4 Articles Daily</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Business Structure:</span>
                  <span className="font-semibold">LLC</span>
                </div>
              </div>
            </div>

            {/* Our Coverage */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Our Coverage</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 p-2 rounded text-center">World News</div>
                <div className="bg-gray-50 p-2 rounded text-center">Politics</div>
                <div className="bg-gray-50 p-2 rounded text-center">Culture</div>
                <div className="bg-gray-50 p-2 rounded text-center">AI & Tech</div>
                <div className="bg-gray-50 p-2 rounded text-center">Sports</div>
                <div className="bg-gray-50 p-2 rounded text-center">Opinion</div>
                <div className="bg-gray-50 p-2 rounded text-center">Insights</div>
                <div className="bg-gray-50 p-2 rounded text-center">Trending</div>
              </div>
            </div>

            {/* Leadership */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Leadership</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-orange-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl font-bold text-orange-600">NK</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">Nasir Khan</h4>
                  <p className="text-sm text-gray-600 mb-2">Founder & Editor-in-Chief</p>
                  <p className="text-xs text-gray-500">
                    Computer Science Graduate<br/>
                    East West University, 2025
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-orange-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl font-bold text-orange-600">IK</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">Imran Khan</h4>
                  <p className="text-sm text-gray-600 mb-2">Co-Founder</p>
                  <p className="text-xs text-gray-500">
                    IT Student<br/>
                    ULAB University, Lahti, Finland
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Journey</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Be part of a growing community that values quality journalism and cross-generational dialogue. 
            Whether you're a reader, contributor, or supporter, there's a place for you at The Age Of GenZ.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/contact"
              className="bg-transparent border border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
            <Link
              to="/join"
              className="bg-orange-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-800 transition-colors"
            >
              Join Our Team
            </Link>
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/" className="text-orange-500 hover:text-orange-600 transition-colors">
              &larr; Return to Home
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-orange-600 transition-colors">
              Contact Us
            </Link>
            <Link to="/join" className="text-gray-600 hover:text-orange-600 transition-colors">
              Careers
            </Link>
            <Link to="/privacy" className="text-gray-600 hover:text-orange-600 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
