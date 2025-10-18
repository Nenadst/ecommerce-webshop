import { Plus, Download, Package, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Order } from '../types/order.types';
import { downloadOrderLog } from '../utils/orderUtils';

interface OrderItemsSectionProps {
  order: Order;
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

export function OrderItemsSection({
  order,
  getItemValue,
  onItemFieldChange,
  hasItemChanges,
  onSaveItem,
  onCancelItem,
  onRemoveItem,
  onOpenAddProduct,
}: OrderItemsSectionProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-900 text-lg">Order Items</h3>
        <div className="flex gap-2">
          <button
            onClick={() => downloadOrderLog(order.id, order.orderNumber)}
            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Log
          </button>
          <button
            onClick={() => onOpenAddProduct(order.id)}
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
                  onItemFieldChange(item.id, 'quantity', newQuantity, item.quantity);
                }}
                className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:ring-2 focus:ring-sky-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              {hasItemChanges(item.id) && (
                <button
                  onClick={() => onSaveItem(item.id)}
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
                  onItemFieldChange(item.id, 'price', newPrice, item.price);
                }}
                className="w-24 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:ring-2 focus:ring-sky-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              {hasItemChanges(item.id) && (
                <button
                  onClick={() => onCancelItem(item.id)}
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
              onClick={() => onRemoveItem(item.id)}
              className="text-red-600 hover:text-red-800 transition"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
