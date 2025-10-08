'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import HeaderTop from '@/shared/components/layouts/HeaderTop';
import HeaderBottom from '@/shared/components/layouts/HeaderBottom';
import Footer from '@/shared/components/layouts/Footer';
import { CheckCircle, Package, Mail, Phone, MapPin, CreditCard, Calendar } from 'lucide-react';

const ORDER_BY_NUMBER_QUERY = gql`
  query OrderByNumber($orderNumber: String!) {
    orderByNumber(orderNumber: $orderNumber) {
      id
      orderNumber
      status
      email
      phone
      firstName
      lastName
      address
      city
      postalCode
      country
      paymentMethod
      paymentStatus
      subtotal
      tax
      shipping
      total
      items {
        id
        name
        price
        quantity
        image
      }
      createdAt
    }
  }
`;

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  items: OrderItem[];
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const [mounted, setMounted] = useState(false);

  const { data, loading, error } = useQuery(ORDER_BY_NUMBER_QUERY, {
    variables: { orderNumber },
    skip: !orderNumber,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!orderNumber && mounted) {
      router.push('/');
    }
  }, [orderNumber, mounted, router]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <HeaderTop />
        <HeaderBottom />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-sky-900 text-lg">Loading order details...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data?.orderByNumber) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <HeaderTop />
        <HeaderBottom />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
            <p className="text-gray-600 mb-4">
              We couldn't find an order with this order number.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
            >
              Back to Home
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const order: Order = data.orderByNumber;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HeaderTop />
      <HeaderBottom />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your order. We've sent a confirmation email to{' '}
            <span className="font-semibold">{order.email}</span>
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 rounded-lg">
            <Package className="w-5 h-5 text-sky-600" />
            <span className="text-sm font-medium text-sky-900">
              Order Number: <span className="font-bold">{order.orderNumber}</span>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Status</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Order Status:</span>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Payment Status:</span>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                  order.paymentStatus
                )}`}
              >
                {order.paymentStatus}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                {!item.image && (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-sm text-gray-600">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax:</span>
              <span className="text-gray-900">${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping:</span>
              <span className="text-gray-900">${order.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t">
              <span className="text-gray-900">Total:</span>
              <span className="text-sky-600">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-sky-600" />
              <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p className="font-semibold text-gray-900">
                {order.firstName} {order.lastName}
              </p>
              <p>{order.address}</p>
              <p>
                {order.city}, {order.postalCode}
              </p>
              <p>{order.country}</p>
              <div className="pt-3 space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{order.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{order.phone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-sky-600" />
              <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="font-semibold text-gray-900 capitalize">
                {order.paymentMethod.replace('_', ' ')}
              </p>
              <p
                className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                  order.paymentStatus
                )}`}
              >
                {order.paymentStatus}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push('/products')}
            className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition font-medium"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-white text-sky-600 border border-sky-600 rounded-lg hover:bg-sky-50 transition font-medium"
          >
            Back to Home
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
