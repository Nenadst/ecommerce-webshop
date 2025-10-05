'use client';

import React, { useState, useMemo } from 'react';
import { useAdminOrders } from '../hooks/useAdminOrders';
import Spinner from '@/shared/components/spinner/Spinner';
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  CreditCard,
  Package,
  Trash2,
  Plus,
  Download,
} from 'lucide-react';
import Image from 'next/image';
import AddProductModal from './AddProductModal';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string | null;
  }>;
}

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

export default function AdminOrders() {
  const {
    orders,
    loading,
    updateOrderStatus,
    updateOrderDetails,
    updateOrderItem,
    removeOrderItem,
    addOrderItem,
  } = useAdminOrders();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>('');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [editedItems, setEditedItems] = useState<{
    [key: string]: { quantity?: number; price?: number };
  }>({});
  const [editedData, setEditedData] = useState<{
    [key: string]: {
      email: string;
      phone: string;
      firstName: string;
      lastName: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
      paymentMethod: string;
    };
  }>({});

  const toggleOrder = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order: Order) => {
      const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
      const matchesPaymentStatus =
        filterPaymentStatus === 'ALL' || order.paymentStatus === filterPaymentStatus;
      const matchesSearch =
        searchTerm === '' ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(searchTerm.toLowerCase());

      const orderDate = new Date(order.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);

      const matchesDateRange = (!start || orderDate >= start) && (!end || orderDate <= end);

      return matchesStatus && matchesPaymentStatus && matchesSearch && matchesDateRange;
    });
  }, [orders, filterStatus, filterPaymentStatus, searchTerm, startDate, endDate]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus, undefined);
  };

  const handlePaymentStatusChange = async (orderId: string, newPaymentStatus: string) => {
    await updateOrderStatus(orderId, undefined, newPaymentStatus);
  };

  const handleFieldChange = (orderId: string, field: string, value: string) => {
    setEditedData((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || {}),
        [field]: value,
      } as {
        email: string;
        phone: string;
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        postalCode: string;
        country: string;
        paymentMethod: string;
      },
    }));
  };

  const getFieldValue = (orderId: string, field: keyof Order, order: Order) => {
    if (editedData[orderId] && field in editedData[orderId]) {
      return editedData[orderId][field as keyof (typeof editedData)[typeof orderId]];
    }
    return order[field] as string;
  };

  const handleCancelEdit = (orderId: string) => {
    setEditedData((prev) => {
      const newData = { ...prev };
      delete newData[orderId];
      return newData;
    });
  };

  const handleSaveEdit = async (orderId: string) => {
    if (editedData[orderId]) {
      await updateOrderDetails(orderId, editedData[orderId]);
      setEditedData((prev) => {
        const newData = { ...prev };
        delete newData[orderId];
        return newData;
      });
    }
  };

  const hasChanges = (orderId: string, order: Order) => {
    if (!editedData[orderId]) return false;

    const edited = editedData[orderId];
    return (
      (edited.email !== undefined && edited.email !== order.email) ||
      (edited.phone !== undefined && edited.phone !== order.phone) ||
      (edited.firstName !== undefined && edited.firstName !== order.firstName) ||
      (edited.lastName !== undefined && edited.lastName !== order.lastName) ||
      (edited.address !== undefined && edited.address !== order.address) ||
      (edited.city !== undefined && edited.city !== order.city) ||
      (edited.postalCode !== undefined && edited.postalCode !== order.postalCode) ||
      (edited.country !== undefined && edited.country !== order.country) ||
      (edited.paymentMethod !== undefined && edited.paymentMethod !== order.paymentMethod)
    );
  };

  const handleItemFieldChange = (
    itemId: string,
    field: 'quantity' | 'price',
    value: number,
    originalValue: number
  ) => {
    if (value === originalValue) {
      setEditedItems((prev) => {
        const newItems = { ...prev };
        if (newItems[itemId]) {
          delete newItems[itemId][field];
          if (Object.keys(newItems[itemId]).length === 0) {
            delete newItems[itemId];
          }
        }
        return newItems;
      });
    } else {
      setEditedItems((prev) => ({
        ...prev,
        [itemId]: {
          ...(prev[itemId] || {}),
          [field]: value,
        },
      }));
    }
  };

  const handleSaveItem = async (itemId: string) => {
    if (editedItems[itemId]) {
      await updateOrderItem(itemId, editedItems[itemId].quantity, editedItems[itemId].price);
      setEditedItems((prev) => {
        const newItems = { ...prev };
        delete newItems[itemId];
        return newItems;
      });
    }
  };

  const handleCancelItem = (itemId: string) => {
    setEditedItems((prev) => {
      const newItems = { ...prev };
      delete newItems[itemId];
      return newItems;
    });
  };

  const hasItemChanges = (itemId: string) => {
    return !!editedItems[itemId] && Object.keys(editedItems[itemId]).length > 0;
  };

  const getItemValue = (
    itemId: string,
    field: 'quantity' | 'price',
    originalValue: number
  ): number => {
    return editedItems[itemId]?.[field] ?? originalValue;
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownloadLog = async (orderId: string, orderNumber: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${orderId}/logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download log');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order-${orderNumber}-log.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading log:', error);
      alert('Failed to download order log');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-sky-900">Order Management</h1>
        <div className="text-gray-600">
          {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Order number, customer name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="ALL">All Statuses</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
            <select
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="ALL">All Payment Statuses</option>
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent cursor-pointer hover:border-gray-400 transition"
                style={{
                  colorScheme: 'light',
                }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent cursor-pointer hover:border-gray-400 transition"
                style={{
                  colorScheme: 'light',
                }}
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
            >
              Clear Dates
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          filteredOrders.map((order: Order) => {
            const isExpanded = expandedOrders.has(order.id);
            return (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div
                  className="bg-gray-50 px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleOrder(order.id)}
                >
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-6 flex-grow">
                      <div>
                        <p className="text-sm text-gray-500">Order Number</p>
                        <p className="text-lg font-bold text-sky-900">{order.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-medium text-gray-900">
                          {order.user.name || order.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Created At</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-500">Total</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          €{order.total.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Items</p>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-600" />
                          <span className="font-semibold text-gray-900">{order.items.length}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 text-lg mb-3">
                          Status Management
                        </h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Order Status
                          </label>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          >
                            {ORDER_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Status
                          </label>
                          <select
                            value={order.paymentStatus}
                            onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          >
                            {PAYMENT_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 text-lg mb-3">
                          Customer Information
                        </h3>

                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                              </label>
                              <input
                                type="text"
                                value={getFieldValue(order.id, 'firstName', order)}
                                onChange={(e) =>
                                  handleFieldChange(order.id, 'firstName', e.target.value)
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                              </label>
                              <input
                                type="text"
                                value={getFieldValue(order.id, 'lastName', order)}
                                onChange={(e) =>
                                  handleFieldChange(order.id, 'lastName', e.target.value)
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              value={getFieldValue(order.id, 'email', order)}
                              onChange={(e) => handleFieldChange(order.id, 'email', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone
                            </label>
                            <input
                              type="tel"
                              value={getFieldValue(order.id, 'phone', order)}
                              onChange={(e) => handleFieldChange(order.id, 'phone', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address
                            </label>
                            <input
                              type="text"
                              value={getFieldValue(order.id, 'address', order)}
                              onChange={(e) =>
                                handleFieldChange(order.id, 'address', e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                City
                              </label>
                              <input
                                type="text"
                                value={getFieldValue(order.id, 'city', order)}
                                onChange={(e) =>
                                  handleFieldChange(order.id, 'city', e.target.value)
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Postal Code
                              </label>
                              <input
                                type="text"
                                value={getFieldValue(order.id, 'postalCode', order)}
                                onChange={(e) =>
                                  handleFieldChange(order.id, 'postalCode', e.target.value)
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Country
                              </label>
                              <select
                                value={getFieldValue(order.id, 'country', order)}
                                onChange={(e) =>
                                  handleFieldChange(order.id, 'country', e.target.value)
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                              >
                                <option value="Portugal">Portugal</option>
                                <option value="Belgium">Belgium</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Payment Method
                            </label>
                            <select
                              value={getFieldValue(order.id, 'paymentMethod', order)}
                              onChange={(e) =>
                                handleFieldChange(order.id, 'paymentMethod', e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            >
                              <option value="card">Card</option>
                            </select>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handleSaveEdit(order.id)}
                              disabled={!hasChanges(order.id, order)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={() => handleCancelEdit(order.id)}
                              disabled={!hasChanges(order.id, order)}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg">Order Items</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownloadLog(order.id, order.orderNumber)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download Log
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setIsAddProductModalOpen(true);
                            }}
                            className="px-3 py-1 bg-sky-900 text-white rounded-lg hover:bg-sky-800 transition text-sm font-medium flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add Product
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-0"
                          >
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                            </div>
                            <div className="flex flex-col items-center">
                              <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                              <input
                                type="number"
                                min="1"
                                value={getItemValue(item.id, 'quantity', item.quantity)}
                                onChange={(e) => {
                                  const newQuantity = parseInt(e.target.value) || 1;
                                  handleItemFieldChange(
                                    item.id,
                                    'quantity',
                                    newQuantity,
                                    item.quantity
                                  );
                                }}
                                className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:ring-2 focus:ring-sky-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              {hasItemChanges(item.id) && (
                                <button
                                  onClick={() => handleSaveItem(item.id)}
                                  className="mt-2 w-20 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition"
                                >
                                  Save
                                </button>
                              )}
                            </div>
                            <div className="flex flex-col items-center">
                              <label className="block text-xs text-gray-500 mb-1">Price (€)</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={getItemValue(item.id, 'price', item.price)}
                                onChange={(e) => {
                                  const newPrice = parseFloat(e.target.value) || 0;
                                  handleItemFieldChange(item.id, 'price', newPrice, item.price);
                                }}
                                className="w-24 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:ring-2 focus:ring-sky-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              {hasItemChanges(item.id) && (
                                <button
                                  onClick={() => handleCancelItem(item.id)}
                                  className="mt-2 w-24 py-1 bg-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-400 transition"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                            <div className="text-right w-24">
                              <p className="font-bold text-sky-900">
                                €
                                {(
                                  getItemValue(item.id, 'price', item.price) *
                                  getItemValue(item.id, 'quantity', item.quantity)
                                ).toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">total</p>
                            </div>
                            <button
                              onClick={() => removeOrderItem(item.id)}
                              className="text-red-600 hover:text-red-800 transition"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium text-gray-900">
                            €{order.subtotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tax:</span>
                          <span className="font-medium text-gray-900">€{order.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Shipping:</span>
                          <span className="font-medium text-gray-900">
                            €{order.shipping.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2 mt-2">
                          <span className="text-gray-900">Total:</span>
                          <span className="text-sky-900">€{order.total.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-300 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Payment Method:</span> {order.paymentMethod}
                        </p>
                        <p className="mt-1">
                          <span className="font-medium">Last Updated:</span>{' '}
                          {formatDate(order.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => {
          setIsAddProductModalOpen(false);
          setSelectedOrderId(null);
        }}
        onAddProduct={(productId, quantity, price) => {
          if (selectedOrderId) {
            addOrderItem(selectedOrderId, productId, quantity, price);
          }
        }}
      />
    </div>
  );
}
