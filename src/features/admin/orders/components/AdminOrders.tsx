'use client';

import { useState } from 'react';
import { useAdminOrders } from '../hooks/useAdminOrders';
import { useOrderFilters } from '../hooks/useOrderFilters';
import { useOrderItemEditor } from '../hooks/useOrderItemEditor';
import { useOrderDetailsEditor } from '../hooks/useOrderDetailsEditor';
import { OrderFilters } from './OrderFilters';
import { OrderList } from './OrderList';
import AddProductModal from './AddProductModal';
import Spinner from '@/shared/components/spinner/Spinner';

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

  const { filters, filteredOrders, clearDates } = useOrderFilters(orders);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { editedItems, handleItemFieldChange, getItemValue, hasItemChanges, clearItemEdits } =
    useOrderItemEditor();

  const {
    getFieldValue,
    handleFieldChange,
    handleCancelEdit,
    hasChanges,
    getEditedData,
    clearEditedData,
  } = useOrderDetailsEditor();

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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus, undefined);
  };

  const handlePaymentStatusChange = async (orderId: string, newPaymentStatus: string) => {
    await updateOrderStatus(orderId, undefined, newPaymentStatus);
  };

  const handleSaveEdit = async (orderId: string) => {
    const editedData = getEditedData(orderId);
    if (editedData) {
      await updateOrderDetails(orderId, editedData);
      clearEditedData(orderId);
    }
  };

  const handleSaveItem = async (itemId: string) => {
    if (editedItems[itemId]) {
      await updateOrderItem(itemId, editedItems[itemId].quantity, editedItems[itemId].price);
      clearItemEdits(itemId);
    }
  };

  const handleCancelItem = (itemId: string) => {
    clearItemEdits(itemId);
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

      <OrderFilters filters={filters} clearDates={clearDates} />

      <OrderList
        orders={filteredOrders}
        expandedOrders={expandedOrders}
        onToggleOrder={toggleOrder}
        onStatusChange={handleStatusChange}
        onPaymentStatusChange={handlePaymentStatusChange}
        getFieldValue={getFieldValue}
        onFieldChange={handleFieldChange}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        hasChanges={hasChanges}
        getItemValue={getItemValue}
        onItemFieldChange={handleItemFieldChange}
        hasItemChanges={hasItemChanges}
        onSaveItem={handleSaveItem}
        onCancelItem={handleCancelItem}
        onRemoveItem={removeOrderItem}
        onOpenAddProduct={(orderId) => {
          setSelectedOrderId(orderId);
          setIsAddProductModalOpen(true);
        }}
      />

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
