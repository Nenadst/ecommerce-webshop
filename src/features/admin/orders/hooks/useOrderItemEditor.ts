import { useState } from 'react';
import { OrderItemEditData } from '../types/order.types';

export function useOrderItemEditor() {
  const [editedItems, setEditedItems] = useState<{
    [key: string]: OrderItemEditData;
  }>({});

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

  const getItemValue = (
    itemId: string,
    field: 'quantity' | 'price',
    originalValue: number
  ): number => {
    return editedItems[itemId]?.[field] ?? originalValue;
  };

  const hasItemChanges = (itemId: string) => {
    return !!editedItems[itemId] && Object.keys(editedItems[itemId]).length > 0;
  };

  const clearItemEdits = (itemId: string) => {
    setEditedItems((prev) => {
      const newItems = { ...prev };
      delete newItems[itemId];
      return newItems;
    });
  };

  return {
    editedItems,
    handleItemFieldChange,
    getItemValue,
    hasItemChanges,
    clearItemEdits,
  };
}
