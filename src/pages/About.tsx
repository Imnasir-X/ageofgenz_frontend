import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">About Us</h1>
          <p className="text-gray-600 mt-2">The Voice of Generation Z</p>
        </div>

        <div className="bg-gray-900 rounded border border-gray-800 p-8 shadow-lg">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Who We Are</h2>
            <p className="text-gray-300 mb-4">
              Welcome to The Age of GenZ, your go-to source for news that matters to the next generation. We’re a team of passionate storytellers, tech enthusiasts, and truth-seekers dedicated to delivering fresh, bold, and unfiltered perspectives on the world.
            </p>
            <p className="text-gray-300">
              Founded in 2025, we aim to cut through the noise with content that’s relevant, engaging, and designed for a digital-first audience. From trending topics to deep dives into AI and culture, we’ve got you covered.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Our Mission</h2>
            <p className="text-gray-300 mb-4">
              Our mission is simple: empower Gen Z with knowledge, spark conversations, and amplify voices that shape the future. We believe in journalism that’s fearless, inclusive, and forward-thinking—because you deserve more than just headlines.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Why We’re Different</h2>
            <ul className="list-disc pl-8 text-gray-300">
              <li className="mb-2">Real Stories: No fluff, just the stuff that impacts your world.</li>
              <li className="mb-2">Tech-Driven: Leveraging AI and innovation to bring you smarter news.</li>
              <li className="mb-2">Community-Focused: Your voice matters—join the conversation.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Get Involved</h2>
            <p className="text-gray-300 mb-4">
              Want to be part of our journey? Whether it’s submitting a story, joining our team, or supporting us, we’d love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="/contact"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded transition-colors text-center"
              >
                Contact Us
              </a>
              <a
                href="/join"
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded transition-colors text-center"
              >
                Join Today
              </a>
            </div>
          </section>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-orange-500 hover:text-orange-600 transition-colors">
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;