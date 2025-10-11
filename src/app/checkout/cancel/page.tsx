'use client';

import Link from 'next/link';
import HeaderTop from '@/shared/components/layouts/HeaderTop';
import HeaderBottom from '@/shared/components/layouts/HeaderBottom';
import Footer from '@/shared/components/layouts/Footer';
import Button from '@/shared/components/elements/Button';

export default function CancelPage() {
  return (
    <main className="bg-white">
      <HeaderTop />
      <HeaderBottom />
      <div className="bg-gradient-to-b from-sky-50 to-white min-h-screen">
        <div className="bg-gradient-to-r from-sky-900 via-cyan-700 to-sky-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-4">Payment Cancelled</h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-12 h-12 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-sky-900 mb-4">Your order was cancelled</h2>
              <p className="text-gray-600 text-lg mb-8">
                Your payment was not processed. Your cart items are still saved and you can try
                again whenever you&apos;re ready.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/checkout">
                <Button className="bg-sky-900 hover:bg-sky-800 text-white px-8 py-4 text-lg font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl">
                  Return to Checkout
                </Button>
              </Link>
              <Link href="/cart">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 text-lg font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl">
                  View Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
