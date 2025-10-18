import { Package } from 'lucide-react';
import { Order } from '../types/order.types';
import { OrderCard } from './OrderCard';

interface OrderListProps {
  orders: Order[];
  expandedOrders: Set<string>;
  onToggleOrder: (orderId: string) => void;
  onStatusChange: (orderId: string, newStatus: string) => void;
  onPaymentStatusChange: (orderId: string, newPaymentStatus: string) => void;
  getFieldValue: (orderId: string, field: keyof Order, order: Order) => string;
  onFieldChange: (orderId: string, field: string, value: string) => void;
  onSaveEdit: (orderId: string) => void;
  onCancelEdit: (orderId: string) => void;
  hasChanges: (orderId: string, order: Order) => boolean;
  getItemValue: (itemId: string, field: 'quantity' | 'price', originalValue: number) => number;
  onItemFieldChange: (
    itemId: string,
    field: 'quantity' | 'price',
    value: number,
    originalValue: number
  ) => void;
  hasItemChanges: (itemId: string) => boolean;
  onSaveItem: (itemId: string) => void;
  onCancelItem: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
  onOpenAddProduct: (orderId: string) => void;
}

export function OrderList({
  orders,
  expandedOrders,
  onToggleOrder,
  onStatusChange,
  onPaymentStatusChange,
  getFieldValue,
  onFieldChange,
  onSaveEdit,
  onCancelEdit,
  hasChanges,
  getItemValue,
  onItemFieldChange,
  hasItemChanges,
  onSaveItem,
  onCancelItem,
  onRemoveItem,
  onOpenAddProduct,
}: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders found</h3>
        <p className="text-gray-500">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const isExpanded = expandedOrders.has(order.id);
        return (
          <OrderCard
            key={order.id}
            order={order}
            isExpanded={isExpanded}
            onToggle={() => onToggleOrder(order.id)}
            onStatusChange={onStatusChange}
            onPaymentStatusChange={onPaymentStatusChange}
            getFieldValue={getFieldValue}
            onFieldChange={onFieldChange}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
            hasChanges={hasChanges}
            getItemValue={getItemValue}
            onItemFieldChange={onItemFieldChange}
            hasItemChanges={hasItemChanges}
            onSaveItem={onSaveItem}
            onCancelItem={onCancelItem}
            onRemoveItem={onRemoveItem}
            onOpenAddProduct={onOpenAddProduct}
          />
        );
      })}
    </div>
  );
}
