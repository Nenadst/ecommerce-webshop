import { useState } from 'react';
import { Order, OrderDetailsEditData } from '../types/order.types';

export function useOrderDetailsEditor() {
  const [editedData, setEditedData] = useState<{
    [key: string]: OrderDetailsEditData;
  }>({});

  const handleFieldChange = (orderId: string, field: string, value: string) => {
    setEditedData((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || {}),
        [field]: value,
      } as OrderDetailsEditData,
    }));
  };

  const getFieldValue = (orderId: string, field: keyof Order, order: Order) => {
    if (editedData[orderId] && field in editedData[orderId]) {
      return editedData[orderId][field as keyof OrderDetailsEditData];
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

  const getEditedData = (orderId: string) => {
    return editedData[orderId];
  };

  const clearEditedData = (orderId: string) => {
    setEditedData((prev) => {
      const newData = { ...prev };
      delete newData[orderId];
      return newData;
    });
  };

  return {
    editedData,
    handleFieldChange,
    getFieldValue,
    handleCancelEdit,
    hasChanges,
    getEditedData,
    clearEditedData,
  };
}
