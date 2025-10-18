import { Order } from '../types/order.types';
import { OrderCardHeader } from './OrderCardHeader';
import { OrderStatusSection } from './OrderStatusSection';
import { CustomerInfoSection } from './CustomerInfoSection';
import { OrderItemsSection } from './OrderItemsSection';
import { OrderSummary } from './OrderSummary';

interface OrderCardProps {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
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

export function OrderCard({
  order,
  isExpanded,
  onToggle,
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
}: OrderCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <OrderCardHeader order={order} isExpanded={isExpanded} onToggle={onToggle} />
      {isExpanded && (
        <div className="p-6 border-t border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <OrderStatusSection
              order={order}
              onStatusChange={onStatusChange}
              onPaymentStatusChange={onPaymentStatusChange}
            />
            <CustomerInfoSection
              order={order}
              getFieldValue={getFieldValue}
              onFieldChange={onFieldChange}
              onSave={onSaveEdit}
              onCancel={onCancelEdit}
              hasChanges={hasChanges}
            />
          </div>
          <OrderItemsSection
            order={order}
            getItemValue={getItemValue}
            onItemFieldChange={onItemFieldChange}
            hasItemChanges={hasItemChanges}
            onSaveItem={onSaveItem}
            onCancelItem={onCancelItem}
            onRemoveItem={onRemoveItem}
            onOpenAddProduct={onOpenAddProduct}
          />
          <OrderSummary order={order} />
        </div>
      )}
    </div>
  );
}
