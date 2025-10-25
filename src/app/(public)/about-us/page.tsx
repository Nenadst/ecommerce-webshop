import React from 'react';

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="bg-gradient-to-r from-sky-900 via-cyan-700 to-sky-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">About Us</h1>
            <p className="text-xl text-sky-100">Learn more about our story</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-48 h-48 mx-auto bg-gradient-to-br from-sky-100 to-cyan-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-24 h-24 text-sky-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-sky-900 mb-4">Coming Soon</h2>
            <p className="text-gray-600 text-lg mb-8">
              We&apos;re preparing our story to share with you. Stay tuned to learn more about who
              we are and what we do!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
