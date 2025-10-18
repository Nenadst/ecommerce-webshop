import { Order } from '../types/order.types';
import { formatDate } from '../utils/orderUtils';

interface OrderSummaryProps {
  order: Order;
}

export function OrderSummary({ order }: OrderSummaryProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium text-gray-900">€{order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax:</span>
          <span className="font-medium text-gray-900">€{order.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping:</span>
          <span className="font-medium text-gray-900">€{order.shipping.toFixed(2)}</span>
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
          <span className="font-medium">Last Updated:</span> {formatDate(order.updatedAt)}
        </p>
      </div>
    </div>
  );
}
