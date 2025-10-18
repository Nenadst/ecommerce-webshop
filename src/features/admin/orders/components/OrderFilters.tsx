import { ORDER_STATUSES, PAYMENT_STATUSES } from '../types/order.types';

interface OrderFiltersProps {
  filters: {
    filterStatus: string;
    setFilterStatus: (value: string) => void;
    filterPaymentStatus: string;
    setFilterPaymentStatus: (value: string) => void;
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    startDate: string;
    setStartDate: (value: string) => void;
    endDate: string;
    setEndDate: (value: string) => void;
  };
  clearDates: () => void;
}

export function OrderFilters({ filters, clearDates }: OrderFiltersProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            type="text"
            placeholder="Order number, customer name, email..."
            value={filters.searchTerm}
            onChange={(e) => filters.setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
          <select
            value={filters.filterStatus}
            onChange={(e) => filters.setFilterStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="ALL">All Statuses</option>
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
            value={filters.filterPaymentStatus}
            onChange={(e) => filters.setFilterPaymentStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="ALL">All Payment Statuses</option>
            {PAYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <div className="relative">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => filters.setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent cursor-pointer hover:border-gray-400 transition"
              style={{
                colorScheme: 'light',
              }}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <div className="relative">
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => filters.setEndDate(e.target.value)}
              min={filters.startDate}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent cursor-pointer hover:border-gray-400 transition"
              style={{
                colorScheme: 'light',
              }}
            />
          </div>
        </div>
        <div className="flex items-end">
          <button
            onClick={clearDates}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
          >
            Clear Dates
          </button>
        </div>
      </div>
    </div>
  );
}
