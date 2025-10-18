import { Order, ORDER_STATUSES, PAYMENT_STATUSES } from '../types/order.types';

interface OrderStatusSectionProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: string) => void;
  onPaymentStatusChange: (orderId: string, newPaymentStatus: string) => void;
}

export function OrderStatusSection({
  order,
  onStatusChange,
  onPaymentStatusChange,
}: OrderStatusSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 text-lg mb-3">Status Management</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
        <select
          value={order.status}
          onChange={(e) => onStatusChange(order.id, e.target.value)}
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
        <select
          value={order.paymentStatus}
          onChange={(e) => onPaymentStatusChange(order.id, e.target.value)}
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
  );
}
