'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useApolloClient, gql } from '@apollo/client';
import { Card } from '@/shared/components/elements/Card';
import { useCart } from '@/shared/contexts/CartContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import Spinner from '@/shared/components/spinner/Spinner';
import Button from '@/shared/components/elements/Button';
import toast from 'react-hot-toast';
import { CREATE_ORDER } from '@/entities/order/api/order.queries';

const GET_PRODUCTS_BY_IDS = gql`
  query GetProductsByIds($ids: [ID!]!) {
    productsByIds(ids: $ids) {
      id
      name
      quantity
    }
  }
`;

interface CheckoutFormData {
  email: string;
  phone: string;

  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;

  paymentMethod: 'card' | 'paypal' | 'bank';
  cardNumber?: string;
  cardName?: string;
  cardExpiry?: string;
  cardCVV?: string;

  saveInfo: boolean;
  sameAsBilling: boolean;
}

const Checkout = () => {
  const router = useRouter();
  const client = useApolloClient();
  const { cartItems, total, itemCount, loading, mounted } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [createOrder] = useMutation(CREATE_ORDER);

  const [formData, setFormData] = useState<CheckoutFormData>(() => {
    const nameParts = user?.name?.split(' ') || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      email: user?.email || '',
      phone: '',
      firstName,
      lastName,
      address: '',
      city: '',
      postalCode: '',
      country: 'Portugal',
      paymentMethod: 'card',
      saveInfo: false,
      sameAsBilling: true,
    };
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name as keyof CheckoutFormData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {};

    if (step === 1) {
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.postalCode) newErrors.postalCode = 'Postal code is required';
      if (!formData.country) newErrors.country = 'Country is required';
    }

    if (step === 2 && formData.paymentMethod === 'card') {
      if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required';
      else if (formData.cardNumber.replace(/\s/g, '').length !== 16)
        newErrors.cardNumber = 'Card number must be 16 digits';
      if (!formData.cardName) newErrors.cardName = 'Cardholder name is required';
      if (!formData.cardExpiry) newErrors.cardExpiry = 'Expiry date is required';
      if (!formData.cardCVV) newErrors.cardCVV = 'CVV is required';
      else if (formData.cardCVV.length !== 3) newErrors.cardCVV = 'CVV must be 3 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePlaceOrder = async () => {
    if (!validateStep(2)) {
      toast.error('Please complete payment information');
      return;
    }

    setIsProcessing(true);

    try {
      // Validate stock before placing order
      const productIds = cartItems.map((item) => item.productId);
      const { data: productsData } = await client.query({
        query: GET_PRODUCTS_BY_IDS,
        variables: { ids: productIds },
        fetchPolicy: 'network-only',
      });

      if (productsData?.productsByIds) {
        const stockIssues: string[] = [];

        for (const cartItem of cartItems) {
          const product = productsData.productsByIds.find(
            (p: { id: string; quantity: number }) => p.id === cartItem.productId
          );

          if (!product) {
            stockIssues.push(`Product not found`);
          } else if (product.quantity < cartItem.quantity) {
            stockIssues.push(
              `${product.name || 'Product'}: Only ${product.quantity} available (you have ${cartItem.quantity} in cart)`
            );
          }
        }

        if (stockIssues.length > 0) {
          toast.error(
            `Stock issues detected:\n${stockIssues.join('\n')}`,
            { duration: 6000 }
          );
          setIsProcessing(false);
          return;
        }
      }

      // Prepare items for guest checkout
      const items = isAuthenticated
        ? undefined
        : cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          }));

      const { data } = await createOrder({
        variables: {
          input: {
            email: formData.email,
            phone: formData.phone,
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
            paymentMethod: formData.paymentMethod,
            items,
          },
        },
      });

      toast.success(`Order placed successfully! Order #${data.createOrder.orderNumber}`, {
        duration: 5000,
        icon: '🎉',
      });

      // Clear guest cart from localStorage
      if (!isAuthenticated) {
        localStorage.removeItem('guest_cart');
      }

      // Redirect based on authentication status
      if (isAuthenticated) {
        router.push(`/profile?tab=orders`);
      } else {
        router.push(`/order-confirmation?orderNumber=${data.createOrder.orderNumber}`);
      }
    } catch (error: unknown) {
      console.error('Failed to place order:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to place order. Please try again.';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
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
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center">
              {[
                { num: 1, label: 'Shipping' },
                { num: 2, label: 'Payment' },
                { num: 3, label: 'Review' },
              ].map((step, index) => (
                <React.Fragment key={step.num}>
                  <div className="flex flex-col items-center relative">
                    <button
                      type="button"
                      onClick={() => {
                        if (step.num <= currentStep) {
                          setCurrentStep(step.num);
                        }
                      }}
                      disabled={step.num > currentStep}
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                        currentStep >= step.num
                          ? 'bg-amber-500 text-white shadow-lg hover:bg-amber-600 cursor-pointer'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      } ${step.num < currentStep ? 'hover:scale-110' : ''}`}
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
                      className={`mt-2 text-sm font-medium ${
                        currentStep >= step.num ? 'text-sky-900' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className="flex items-center" style={{ marginBottom: '28px' }}>
                      <div
                        className={`w-24 h-1 transition-all ${
                          currentStep > step.num ? 'bg-amber-500' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <Card className="p-8">
                {/* Step 1: Shipping Information */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-sky-900 mb-6">Shipping Information</h2>

                    <div className="space-y-6">
                      {/* Contact Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-sky-900 mb-4">Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                                errors.email ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="your@email.com"
                            />
                            {errors.email && (
                              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                                errors.phone ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="+353 XX XXX XXXX"
                            />
                            {errors.phone && (
                              <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Shipping Address */}
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
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {errors.firstName && (
                                <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name *
                              </label>
                              <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {errors.lastName && (
                                <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Street Address *
                            </label>
                            <input
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                                errors.address ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="123 Main Street"
                            />
                            {errors.address && (
                              <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                City *
                              </label>
                              <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                                  errors.city ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {errors.city && (
                                <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Postal Code *
                              </label>
                              <input
                                type="text"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                                  errors.postalCode ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {errors.postalCode && (
                                <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Country *
                              </label>
                              <select
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                                  errors.country ? 'border-red-500' : 'border-gray-300'
                                }`}
                              >
                                <option value="Portugal">Portugal</option>
                                <option value="Belgium">Belgium</option>
                              </select>
                              {errors.country && (
                                <p className="mt-1 text-sm text-red-500">{errors.country}</p>
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
                            checked={formData.saveInfo}
                            onChange={handleInputChange}
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

                {/* Step 2: Payment */}
                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold text-sky-900 mb-6">Payment Method</h2>

                    <div className="space-y-6">
                      {/* Payment Method Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { value: 'card', label: 'Credit Card', icon: '💳' },
                          { value: 'paypal', label: 'PayPal', icon: '🅿️' },
                          { value: 'bank', label: 'Bank Transfer', icon: '🏦' },
                        ].map((method) => (
                          <button
                            key={method.value}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                paymentMethod: method.value as 'card' | 'paypal' | 'bank',
                              }))
                            }
                            className={`p-4 border-2 rounded-lg text-center transition-all ${
                              formData.paymentMethod === method.value
                                ? 'border-amber-500 bg-amber-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-3xl mb-2">{method.icon}</div>
                            <div className="font-medium text-gray-900">{method.label}</div>
                          </button>
                        ))}
                      </div>

                      {/* Card Payment Form */}
                      {formData.paymentMethod === 'card' && (
                        <div className="space-y-4 mt-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Card Number *
                            </label>
                            <input
                              type="text"
                              name="cardNumber"
                              value={formData.cardNumber || ''}
                              onChange={(e) => {
                                const formatted = formatCardNumber(e.target.value);
                                setFormData((prev) => ({ ...prev, cardNumber: formatted }));
                              }}
                              maxLength={19}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                                errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="1234 5678 9012 3456"
                            />
                            {errors.cardNumber && (
                              <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Cardholder Name *
                            </label>
                            <input
                              type="text"
                              name="cardName"
                              value={formData.cardName || ''}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                                errors.cardName ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="John Doe"
                            />
                            {errors.cardName && (
                              <p className="mt-1 text-sm text-red-500">{errors.cardName}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expiry Date *
                              </label>
                              <input
                                type="text"
                                name="cardExpiry"
                                value={formData.cardExpiry || ''}
                                onChange={handleInputChange}
                                maxLength={5}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                                  errors.cardExpiry ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="MM/YY"
                              />
                              {errors.cardExpiry && (
                                <p className="mt-1 text-sm text-red-500">{errors.cardExpiry}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                CVV *
                              </label>
                              <input
                                type="text"
                                name="cardCVV"
                                value={formData.cardCVV || ''}
                                onChange={handleInputChange}
                                maxLength={3}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                                  errors.cardCVV ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="123"
                              />
                              {errors.cardCVV && (
                                <p className="mt-1 text-sm text-red-500">{errors.cardCVV}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {formData.paymentMethod === 'paypal' && (
                        <div className="bg-sky-50 p-6 rounded-lg text-center">
                          <p className="text-gray-700">
                            You will be redirected to PayPal to complete your purchase securely.
                          </p>
                        </div>
                      )}

                      {formData.paymentMethod === 'bank' && (
                        <div className="bg-sky-50 p-6 rounded-lg">
                          <p className="text-gray-700 mb-4">
                            Transfer the total amount to the following bank account:
                          </p>
                          <div className="bg-white p-4 rounded border border-sky-200">
                            <p className="font-mono text-sm">
                              <strong>Account Name:</strong> E-Commerce Store Ltd.
                              <br />
                              <strong>IBAN:</strong> IE29 AIBK 9311 5212 3456 78
                              <br />
                              <strong>BIC:</strong> AIBKIE2D
                            </p>
                          </div>
                        </div>
                      )}
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

                {/* Step 3: Review Order */}
                {currentStep === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold text-sky-900 mb-6">Review Your Order</h2>

                    <div className="space-y-6">
                      {/* Shipping Information Review */}
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

                      {/* Payment Method Review */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-sky-900 mb-3">Payment Method:</h3>
                        <p className="text-gray-700">
                          {formData.paymentMethod === 'card' &&
                            `Credit Card ending in ${formData.cardNumber?.slice(-4)}`}
                          {formData.paymentMethod === 'paypal' && 'PayPal'}
                          {formData.paymentMethod === 'bank' && 'Bank Transfer'}
                        </p>
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="text-sky-600 hover:text-sky-700 text-sm font-medium mt-2"
                        >
                          Edit
                        </button>
                      </div>

                      {/* Order Items */}
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
                        {isProcessing ? 'Processing...' : `Place Order - €${orderTotal.toFixed(2)}`}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Order Summary Sidebar */}
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
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600 truncate mr-2">
                            {item.product?.name} x{item.quantity}
                          </span>
                          <span className="font-medium text-gray-900">
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
