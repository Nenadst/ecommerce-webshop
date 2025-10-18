import { Order } from '../types/order.types';

interface CustomerInfoSectionProps {
  order: Order;
  getFieldValue: (orderId: string, field: keyof Order, order: Order) => string;
  onFieldChange: (orderId: string, field: string, value: string) => void;
  onSave: (orderId: string) => void;
  onCancel: (orderId: string) => void;
  hasChanges: (orderId: string, order: Order) => boolean;
}

export function CustomerInfoSection({
  order,
  getFieldValue,
  onFieldChange,
  onSave,
  onCancel,
  hasChanges,
}: CustomerInfoSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900 text-lg mb-3">Customer Information</h3>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={getFieldValue(order.id, 'firstName', order)}
              onChange={(e) => onFieldChange(order.id, 'firstName', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={getFieldValue(order.id, 'lastName', order)}
              onChange={(e) => onFieldChange(order.id, 'lastName', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={getFieldValue(order.id, 'email', order)}
            onChange={(e) => onFieldChange(order.id, 'email', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={getFieldValue(order.id, 'phone', order)}
            onChange={(e) => onFieldChange(order.id, 'phone', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            value={getFieldValue(order.id, 'address', order)}
            onChange={(e) => onFieldChange(order.id, 'address', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={getFieldValue(order.id, 'city', order)}
              onChange={(e) => onFieldChange(order.id, 'city', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
            <input
              type="text"
              value={getFieldValue(order.id, 'postalCode', order)}
              onChange={(e) => onFieldChange(order.id, 'postalCode', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <select
              value={getFieldValue(order.id, 'country', order)}
              onChange={(e) => onFieldChange(order.id, 'country', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="Portugal">Portugal</option>
              <option value="Belgium">Belgium</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <select
            value={getFieldValue(order.id, 'paymentMethod', order)}
            onChange={(e) => onFieldChange(order.id, 'paymentMethod', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="card">Card</option>
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onSave(order.id)}
            disabled={!hasChanges(order.id, order)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
          >
            Save Changes
          </button>
          <button
            onClick={() => onCancel(order.id)}
            disabled={!hasChanges(order.id, order)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
