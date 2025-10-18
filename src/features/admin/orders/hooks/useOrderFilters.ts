import { useState, useMemo } from 'react';
import { Order } from '../types/order.types';

export function useOrderFilters(orders: Order[]) {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>('');

  const filteredOrders = useMemo(() => {
    return orders.filter((order: Order) => {
      const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
      const matchesPaymentStatus =
        filterPaymentStatus === 'ALL' || order.paymentStatus === filterPaymentStatus;
      const matchesSearch =
        searchTerm === '' ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(searchTerm.toLowerCase());

      const orderDate = new Date(order.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);

      const matchesDateRange = (!start || orderDate >= start) && (!end || orderDate <= end);

      return matchesStatus && matchesPaymentStatus && matchesSearch && matchesDateRange;
    });
  }, [orders, filterStatus, filterPaymentStatus, searchTerm, startDate, endDate]);

  const clearDates = () => {
    setStartDate('');
    setEndDate('');
  };

  return {
    filters: {
      filterStatus,
      setFilterStatus,
      filterPaymentStatus,
      setFilterPaymentStatus,
      searchTerm,
      setSearchTerm,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
    },
    filteredOrders,
    clearDates,
  };
}
