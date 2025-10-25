import React from 'react';

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="bg-gradient-to-r from-sky-900 via-cyan-700 to-sky-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">Blog</h1>
            <p className="text-xl text-sky-100">Stay tuned for our latest updates</p>
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
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-sky-900 mb-4">Coming Soon</h2>
            <p className="text-gray-600 text-lg mb-8">
              We&apos;re working hard to bring you exciting articles, news, and insights. Check back
              soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
