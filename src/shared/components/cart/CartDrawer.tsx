'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/shared/hooks/useCart';
import { useCartDrawer } from '@/shared/contexts/CartDrawerContext';
import Button from '@/shared/components/elements/Button';
import Spinner from '@/shared/components/spinner/Spinner';

const CartDrawer = () => {
  const { isOpen, closeDrawer } = useCartDrawer();
  const { cartItems, total, itemCount, updateQuantity, removeFromCart, loading, mounted } =
    useCart();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeDrawer();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeDrawer]);

  if (!mounted) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-[9998] ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeDrawer}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[9999] flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="bg-gradient-to-r from-sky-900 to-cyan-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <div>
              <h2 className="text-lg font-bold">Shopping Cart</h2>
              <p className="text-xs text-sky-100">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-sky-800 transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-sky-100 to-cyan-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-16 h-16 text-sky-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-sm text-gray-600 mb-4">Add some products to get started!</p>
              <Link href="/products" onClick={closeDrawer}>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg text-sm">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map(
                (item: {
                  id: string;
                  productId: string;
                  quantity: number;
                  product?: {
                    id: string;
                    name: string;
                    price: number;
                    images?: string[];
                    quantity: number;
                    category?: { name: string };
                  };
                }) => {
                  const product = item.product;
                  return (
                    <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-200">
                      <Link
                        href={`/products/${product?.id || item.productId}`}
                        onClick={closeDrawer}
                        className="flex-shrink-0"
                      >
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-sky-50 rounded-lg flex items-center justify-center overflow-hidden">
                          <Image
                            src={product?.images?.[0] || '/assets/img/no-product.png'}
                            alt={product?.name || 'Product'}
                            width={80}
                            height={80}
                            className="object-contain w-full h-full p-2"
                          />
                        </div>
                      </Link>

                      <div className="flex-grow min-w-0">
                        <Link
                          href={`/products/${product?.id || item.productId}`}
                          onClick={closeDrawer}
                          className="block"
                        >
                          <h3 className="text-sm font-semibold text-sky-900 hover:text-sky-700 transition-colors line-clamp-2">
                            {product?.name || 'Product'}
                          </h3>
                        </Link>
                        {product?.category && (
                          <p className="text-xs text-gray-500 mt-1">{product.category.name}</p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 12H4"
                                />
                              </svg>
                            </button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              disabled={product?.quantity && item.quantity >= product.quantity}
                              className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                            aria-label="Remove item"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="text-sm font-bold text-sky-900 mt-2">
                          €{((product?.price || 0) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-900">Subtotal:</span>
              <span className="text-2xl font-bold text-sky-900">€{total.toFixed(2)}</span>
            </div>

            <div className="space-y-2">
              <Link href="/cart" onClick={closeDrawer}>
                <Button className="w-full bg-sky-900 hover:bg-sky-800 text-white py-3 rounded-lg font-semibold transition-colors">
                  View Cart
                </Button>
              </Link>
              <Link href="/checkout" onClick={closeDrawer}>
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 mt-3 rounded-lg font-semibold transition-colors">
                  Checkout
                </Button>
              </Link>
            </div>

            <p className="text-xs text-center text-gray-500 mt-3">Free shipping on all orders</p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
