'use client';

import React from 'react';
import Link from 'next/link';
import Button from '../elements/Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  const defaultMessage =
    'You need to be signed in to use the wishlist feature. Please log in to your account or create a new one to start adding your favorite products!';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-sky-900">Sign in Required</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 text-base leading-relaxed">{message || defaultMessage}</p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/login" className="w-full">
            <Button className="w-full bg-sky-900 hover:bg-sky-800 text-white py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg">
              Log In
            </Button>
          </Link>
          <Link href="/register" className="w-full">
            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg">
              Create Account
            </Button>
          </Link>
          <button
            onClick={onClose}
            className="w-full text-gray-600 hover:text-gray-800 py-2 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
