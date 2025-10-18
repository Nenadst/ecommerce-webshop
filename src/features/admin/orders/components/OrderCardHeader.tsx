import { ChevronDown, ChevronUp, Calendar, CreditCard, Package } from 'lucide-react';
import { Order } from '../types/order.types';
import { getStatusColor, formatDate } from '../utils/orderUtils';

interface OrderCardHeaderProps {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
}

export function OrderCardHeader({ order, isExpanded, onToggle }: OrderCardHeaderProps) {
  return (
    <div
      className="bg-gray-50 px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={onToggle}
    >
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-6 flex-grow">
          <div>
            <p className="text-sm text-gray-500">Order Number</p>
            <p className="text-lg font-bold text-sky-900">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Customer</p>
            <p className="font-medium text-gray-900">{order.user?.name || order.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created At</p>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <span className="font-semibold text-gray-900">€{order.total.toFixed(2)}</span>
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
          {!order.user && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
              GUEST
            </span>
          )}
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
  );
}
