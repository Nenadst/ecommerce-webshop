'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/shared/components/elements/Card';
import { useCart } from '@/shared/contexts/CartContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import Spinner from '@/shared/components/spinner/Spinner';
import Button from '@/shared/components/elements/Button';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutValidationSchema, type CheckoutFormData } from '@/shared/validation/checkout.validation';

const Checkout = () => {
  const router = useRouter();
  const { cartItems, total, itemCount, loading, mounted } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [validatedSteps, setValidatedSteps] = useState<Set<number>>(new Set());

  const nameParts = user?.name?.split(' ') || [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    reset,
    watch,
    setValue,
    clearErrors,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutValidationSchema),
    defaultValues: {
      email: user?.email || '',
      phone: '',
      firstName,
      lastName,
      address: '',
      city: '',
      postalCode: '',
      country: 'Portugal',
      paymentMethod: 'card',
    },
    mode: 'onBlur',
  });

  const formData = watch();
  const selectedCountry = watch('country');

  const postalCodePlaceholders: Record<string, string> = {
    Portugal: '1234-567',
    Belgium: '1234',
  };

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        firstName,
        lastName,
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Portugal',
        paymentMethod: 'card',
      });
    }
  }, [user, firstName, lastName, reset]);

  useEffect(() => {
    const postalCodeValue = getValues('postalCode');
    if (postalCodeValue) {
      trigger('postalCode');
    } else {
      clearErrors('postalCode');
    }
  }, [selectedCountry, clearErrors, trigger, getValues]);

  const handleNextStep = async () => {
    const isValid = await trigger();
    if (isValid) {
      setValidatedSteps((prev) => new Set(prev).add(currentStep));
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    } else {
      toast.error('Please fill in all required fields correctly');
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePlaceOrder = async () => {
    const isValid = await trigger();
    if (!isValid) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsProcessing(true);

    try {
      const formValues = getValues();

      const items = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const shippingInfo = {
        email: formValues.email,
        phone: formValues.phone,
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        address: formValues.address,
        city: formValues.city,
        postalCode: formValues.postalCode,
        country: formValues.country,
      };

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          shippingInfo,
          userId: user?.id || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: unknown) {
      console.error('Failed to create checkout session:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to start checkout. Please try again.';
      toast.error(message);
      setIsProcessing(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="bg-gradient-to-b from-sky-50 to-white min-h-screen">
        <div className="bg-gradient-to-r from-sky-900 via-cyan-700 to-sky-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-4">Checkout</h1>
            </div>
          </div>
        </div>
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-gradient-to-b from-sky-50 to-white min-h-screen">
        <div className="bg-gradient-to-r from-sky-900 via-cyan-700 to-sky-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-4">Checkout</h1>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
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
                Add some items to your cart before checkout
              </p>
            </div>
            <Link href="/products">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 text-lg font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const shippingCost = 0;
  const tax = total * 0.23; // 23% VAT
  const orderTotal = total + shippingCost + tax;

  return (
    <div className="bg-gradient-to-b from-sky-50 to-white min-h-screen">
      <div className="bg-gradient-to-r from-sky-900 via-cyan-700 to-sky-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">Checkout</h1>
            <p className="text-xl text-sky-100">Complete your order</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="flex items-center justify-center">
              {[
                { num: 1, label: 'Shipping' },
                { num: 2, label: 'Payment' },
                { num: 3, label: 'Review' },
              ].map((step, index) => {
                const isAccessible = step.num <= currentStep || validatedSteps.has(step.num - 1);
                return (
                <React.Fragment key={step.num}>
                  <div className="flex flex-col items-center relative">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!isAccessible) return;

                        if (step.num > currentStep) {
                          const isValid = await trigger();
                          if (isValid) {
                            setValidatedSteps((prev) => new Set(prev).add(currentStep));
                            setCurrentStep(step.num);
                          } else {
                            toast.error('Please fill in all required fields correctly');
                          }
                        } else {
                          setCurrentStep(step.num);
                        }
                      }}
                      disabled={!isAccessible}
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                        currentStep === step.num
                          ? 'bg-sky-900 text-white shadow-xl ring-4 ring-sky-300 scale-110'
                          : isAccessible
                          ? 'bg-amber-500 text-white shadow-lg hover:bg-amber-600 cursor-pointer hover:scale-110'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {currentStep > step.num ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        step.num
                      )}
                    </button>
                    <span
                      className={`mt-2 text-sm transition-all ${
                        currentStep === step.num
                          ? 'text-sky-900 font-bold text-base'
                          : isAccessible
                          ? 'text-sky-900 font-medium'
                          : 'text-gray-500 font-medium'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className="flex items-center" style={{ marginBottom: '28px' }}>
                      <div
                        className={`w-24 h-1 transition-all ${
                          currentStep > step.num || validatedSteps.has(step.num) ? 'bg-amber-500' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-8">
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-sky-900 mb-6">Shipping Information</h2>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-sky-900 mb-4">Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              {...register('email')}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                                errors.email ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="your@email.com"
                            />
                            {errors.email && (
                              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              {...register('phone')}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                                errors.phone ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="+351123456789"
                            />
                            {errors.phone && (
                              <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-sky-900 mb-4">
                          Shipping Address
                        </h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name *
                              </label>
                              <input
                                type="text"
                                {...register('firstName')}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {errors.firstName && (
                                <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name *
                              </label>
                              <input
                                type="text"
                                {...register('lastName')}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {errors.lastName && (
                                <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Street Address *
                            </label>
                            <input
                              type="text"
                              {...register('address')}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                                errors.address ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="123 Main Street"
                            />
                            {errors.address && (
                              <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                City *
                              </label>
                              <input
                                type="text"
                                {...register('city')}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                                  errors.city ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {errors.city && (
                                <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Postal Code *
                              </label>
                              <input
                                type="text"
                                {...register('postalCode')}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                                  errors.postalCode ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder={postalCodePlaceholders[selectedCountry] || '1234-567'}
                              />
                              {errors.postalCode && (
                                <p className="mt-1 text-sm text-red-500">{errors.postalCode.message}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Country *
                              </label>
                              <select
                                {...register('country')}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                                  errors.country ? 'border-red-500' : 'border-gray-300'
                                }`}
                              >
                                <option value="Portugal">Portugal</option>
                                <option value="Belgium">Belgium</option>
                              </select>
                              {errors.country && (
                                <p className="mt-1 text-sm text-red-500">{errors.country.message}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {isAuthenticated && (
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="saveInfo"
                            id="saveInfo"
                            className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                          />
                          <label htmlFor="saveInfo" className="ml-2 text-sm text-gray-700">
                            Save this information for next time
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 flex justify-between">
                      <Link href="/cart">
                        <Button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors">
                          ← Back to Cart
                        </Button>
                      </Link>
                      <Button
                        onClick={handleNextStep}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                      >
                        Continue to Payment →
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold text-sky-900 mb-6">Payment Method</h2>

                    <div className="space-y-6">
                      <div className="p-6 border-2 border-sky-200 bg-sky-50 rounded-lg">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">💳</div>
                          <div className="flex-1">
                            <h3 className="font-bold text-sky-900 text-lg mb-2">Secure Payment with Stripe</h3>
                            <p className="text-gray-700 mb-4">
                              Your payment will be processed securely through Stripe. You&apos;ll be redirected to enter your payment details on the next step.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>PCI-DSS Compliant</span>
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <span>SSL Encrypted</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Accepted Payment Methods:</h4>
                        <div className="flex items-center gap-4 text-2xl">
                          <span>💳 Visa</span>
                          <span>💳 Mastercard</span>
                          <span>💳 Amex</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-between">
                      <Button
                        onClick={handlePreviousStep}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        ← Back
                      </Button>
                      <Button
                        onClick={handleNextStep}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                      >
                        Review Order →
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold text-sky-900 mb-6">Review Your Order</h2>

                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-sky-900 mb-3">Shipping To:</h3>
                        <p className="text-gray-700">
                          {formData.firstName} {formData.lastName}
                          <br />
                          {formData.address}
                          <br />
                          {formData.city}, {formData.postalCode}
                          <br />
                          {formData.country}
                          <br />
                          <br />
                          Email: {formData.email}
                          <br />
                          Phone: {formData.phone}
                        </p>
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="text-sky-600 hover:text-sky-700 text-sm font-medium mt-2"
                        >
                          Edit
                        </button>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-sky-900 mb-3">Payment Method:</h3>
                        <p className="text-gray-700">Stripe Secure Checkout</p>
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="text-sky-600 hover:text-sky-700 text-sm font-medium mt-2"
                        >
                          Edit
                        </button>
                      </div>

                      <div>
                        <h3 className="font-semibold text-sky-900 mb-3">Order Items:</h3>
                        <div className="space-y-3">
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
                              };
                            }) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg"
                              >
                                <Image
                                  src={item.product?.images?.[0] || '/assets/img/no-product.png'}
                                  alt={item.product?.name || 'Product'}
                                  width={60}
                                  height={60}
                                  className="object-contain bg-white rounded"
                                />
                                <div className="flex-grow">
                                  <h4 className="font-medium text-gray-900">
                                    {item.product?.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-sky-900">
                                    €{((item.product?.price || 0) * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-between">
                      <Button
                        onClick={handlePreviousStep}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        ← Back
                      </Button>
                      <Button
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        {isProcessing ? 'Redirecting to Stripe...' : `Proceed to Payment - €${orderTotal.toFixed(2)}`}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-bold text-sky-900 mb-4">Order Summary</h2>

                <div className="space-y-2 mb-4">
                  {cartItems
                    .slice(0, 3)
                    .map(
                      (item: {
                        id: string;
                        productId: string;
                        quantity: number;
                        product?: { id: string; name: string; price: number; images?: string[] };
                      }) => (
                        <div key={item.id} className="flex justify-between items-center text-sm py-2">
                          <span className="text-gray-700 truncate mr-3">
                            <span className="font-semibold text-gray-900">{item.quantity}</span>
                            <span className="text-gray-400 mx-1.5">×</span>
                            <span>{item.product?.name}</span>
                          </span>
                          <span className="font-semibold text-gray-900 whitespace-nowrap">
                            €{((item.product?.price || 0) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      )
                    )}
                  {cartItems.length > 3 && (
                    <p className="text-sm text-gray-500 italic">
                      +{cartItems.length - 3} more {cartItems.length - 3 === 1 ? 'item' : 'items'}
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({itemCount} items)</span>
                    <span className="font-medium">€{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (23% VAT)</span>
                    <span className="font-medium">€{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold text-sky-900">
                      <span>Total</span>
                      <span>€{orderTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-2">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-green-900 text-sm mb-1">
                        Free Shipping Included
                      </h4>
                      <p className="text-xs text-gray-600">Estimated delivery: 3-5 business days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
