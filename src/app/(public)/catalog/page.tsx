import React from 'react';

const CatalogPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="bg-gradient-to-r from-sky-900 via-cyan-700 to-sky-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">Catalog</h1>
            <p className="text-xl text-sky-100">Browse our comprehensive catalog</p>
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-sky-900 mb-4">Coming Soon</h2>
            <p className="text-gray-600 text-lg mb-8">
              We&apos;re building an amazing catalog experience for you. Stay tuned for our complete
              product catalog!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;
