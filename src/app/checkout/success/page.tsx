'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import HeaderTop from '@/shared/components/layouts/HeaderTop';
import HeaderBottom from '@/shared/components/layouts/HeaderBottom';
import Footer from '@/shared/components/layouts/Footer';
import Button from '@/shared/components/elements/Button';
import Spinner from '@/shared/components/spinner/Spinner';
import { useAuth } from '@/shared/contexts/AuthContext';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      router.push('/');
      return;
    }

    const verifySession = async () => {
      try {
        const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
        const data = await response.json();

        if (data.orderNumber) {
          setOrderNumber(data.orderNumber);

          localStorage.removeItem('guest_cart');

          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new Event('cart-cleared'));
        } else {
          console.error('No order number returned');
        }
      } catch (error) {
        console.error('Failed to verify session:', error);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [searchParams, router, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-sky-50 to-white min-h-screen">
      <div className="bg-gradient-to-r from-sky-900 via-cyan-700 to-sky-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">Order Confirmed!</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-sky-900 mb-4">Thank You for Your Order!</h2>
            {orderNumber && (
              <p className="text-gray-600 text-lg mb-4">
                Order Number: <span className="font-bold text-sky-900">#{orderNumber}</span>
              </p>
            )}
            <p className="text-gray-600 text-lg mb-8">
              Your payment has been processed successfully. You will receive an email confirmation
              shortly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/profile?tab=orders">
                <Button className="bg-sky-900 hover:bg-sky-800 text-white px-8 py-4 text-lg font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl">
                  View My Orders
                </Button>
              </Link>
            ) : orderNumber ? (
              <Link href={`/order-confirmation?orderNumber=${orderNumber}`}>
                <Button className="bg-sky-900 hover:bg-sky-800 text-white px-8 py-4 text-lg font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl">
                  View Order Details
                </Button>
              </Link>
            ) : null}
            <Link href="/products">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 text-lg font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="bg-white">
      <HeaderTop />
      <HeaderBottom />
      <Suspense fallback={<Spinner />}>
        <SuccessContent />
      </Suspense>
      <Footer />
    </main>
  );
}
