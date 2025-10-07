'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/shared/components/elements/Card';
import { useCart } from '@/shared/contexts/CartContext';
import Spinner from '@/shared/components/spinner/Spinner';
import Button from '@/shared/components/elements/Button';
import ConfirmModal from '@/shared/components/modals/ConfirmModal';

const Cart = () => {
  const {
    cartItems,
    total,
    itemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    loading,
    mounted,
  } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [isClearing, setIsClearing] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    setUpdatingItems((prev) => new Set(prev).add(productId));
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    setRemovingItems((prev) => new Set(prev).add(productId));
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setRemovingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleClearCartClick = () => {
    if (cartItems.length === 0) return;
    setShowClearModal(true);
  };

  const handleConfirmClearCart = async () => {
    setIsClearing(true);
    try {
      await clearCart();
      setShowClearModal(false);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    } finally {
      setIsClearing(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="bg-gradient-to-b from-sky-50 to-white min-h-screen">
        <div className="bg-gradient-to-r from-sky-900 via-cyan-700 to-sky-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-4">Shopping Cart</h1>
            </div>
          </div>
        </div>
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-sky-50 to-white min-h-screen">
      <div className="bg-gradient-to-r from-sky-900 via-cyan-700 to-sky-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">Shopping Cart</h1>
            <p className="text-xl text-sky-100">
              {cartItems.length > 0
                ? `You have ${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your cart`
                : 'Your cart is empty'}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {cartItems.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-16">
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
                    strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-sky-900 mb-4">Your Cart is Empty</h2>
              <p className="text-gray-600 text-lg mb-8">
                Discover amazing products and start adding them to your cart
              </p>
            </div>
            <Link href="/products">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 text-lg font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-sky-900">Cart Items ({itemCount})</h2>
                    <Button
                      onClick={handleClearCartClick}
                      disabled={isClearing}
                      className="text-red-600 hover:text-red-700 font-medium text-sm underline disabled:opacity-50"
                    >
                      {isClearing ? 'Clearing...' : 'Clear Cart'}
                    </Button>
                  </div>

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
                        const isRemoving = removingItems.has(item.productId);
                        const isUpdating = updatingItems.has(item.productId);

                        return (
                          <Card
                            key={item.id}
                            className={`p-4 flex gap-4 transition-all duration-300 ${
                              isRemoving ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                            }`}
                          >
                            <Link
                              href={`/products/${product?.id || item.productId}`}
                              className="flex-shrink-0"
                            >
                              <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-sky-50 rounded-lg flex items-center justify-center overflow-hidden">
                                <Image
                                  src={product?.images?.[0] || '/assets/img/no-product.png'}
                                  alt={product?.name || 'Product'}
                                  width={96}
                                  height={96}
                                  className="object-contain w-full h-full p-2"
                                />
                              </div>
                            </Link>

                            <div className="flex-grow">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <Link href={`/products/${product?.id || item.productId}`}>
                                    <h3 className="text-lg font-semibold text-sky-900 hover:text-sky-700 transition-colors">
                                      {product?.name || 'Product'}
                                    </h3>
                                  </Link>
                                  {product?.category && (
                                    <p className="text-sm text-gray-500">{product.category.name}</p>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleRemoveItem(item.productId)}
                                  disabled={isRemoving}
                                  className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                                  aria-label="Remove item"
                                >
                                  <svg
                                    className="w-5 h-5"
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

                              <div className="flex justify-between items-center mt-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-gray-600">Quantity:</span>
                                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                                    <button
                                      onClick={() =>
                                        handleUpdateQuantity(item.productId, item.quantity - 1)
                                      }
                                      disabled={item.quantity <= 1 || isUpdating || isRemoving}
                                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                      <svg
                                        className="w-4 h-4 text-gray-600"
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
                                    <span className="w-12 text-center font-bold text-gray-900">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleUpdateQuantity(item.productId, item.quantity + 1)
                                      }
                                      disabled={
                                        (product?.quantity && item.quantity >= product.quantity) ||
                                        isUpdating ||
                                        isRemoving
                                      }
                                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                      <svg
                                        className="w-4 h-4 text-gray-600"
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
                                </div>

                                <div className="text-right">
                                  <div className="text-sm text-gray-500">
                                    €{product?.price?.toFixed(2) || '0.00'} each
                                  </div>
                                  <div className="text-xl font-bold text-sky-900">
                                    €{((product?.price || 0) * item.quantity).toFixed(2)}
                                  </div>
                                </div>
                              </div>

                              {product?.quantity !== undefined && product.quantity < 10 && (
                                <div className="mt-2 text-sm text-amber-600 font-medium">
                                  Only {product.quantity} left in stock
                                </div>
                              )}
                            </div>
                          </Card>
                        );
                      }
                    )}
                  </div>
                </div>

                <Link href="/products">
                  <Button className="w-full bg-sky-100 hover:bg-sky-200 text-sky-900 py-3 rounded-lg font-medium transition-colors">
                    ← Continue Shopping
                  </Button>
                </Link>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                  <h2 className="text-2xl font-bold text-sky-900 mb-6">Order Summary</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>
                        Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                      </span>
                      <span className="font-medium">€{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="font-medium text-green-600">FREE</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between text-lg font-bold text-sky-900">
                        <span>Total</span>
                        <span>€{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Link href="/checkout">
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-lg font-bold text-lg transition-colors shadow-lg hover:shadow-xl mb-4">
                      Proceed to Checkout
                    </Button>
                  </Link>

                  <div className="mt-6 p-4 bg-sky-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-sky-900 text-sm mb-1">Secure Checkout</h4>
                        <p className="text-xs text-gray-600">
                          Your payment information is processed securely
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
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
                      <div>
                        <h4 className="font-semibold text-green-900 text-sm mb-1">Free Shipping</h4>
                        <p className="text-xs text-gray-600">
                          On all orders - no minimum purchase required
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleConfirmClearCart}
        title="Clear Cart"
        message="Are you sure you want to clear your entire cart? This action cannot be undone."
        confirmText="Clear Cart"
        cancelText="Cancel"
        isLoading={isClearing}
      />
    </div>
  );
};

export default Cart;
