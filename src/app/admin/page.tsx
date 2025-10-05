'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATS } from '@/entities/order/api/order.queries';
import StatCard from '@/features/admin/dashboard/components/StatCard';
import RevenueChart from '@/features/admin/dashboard/components/RevenueChart';
import OrderStatusChart from '@/features/admin/dashboard/components/OrderStatusChart';
import RecentOrders from '@/features/admin/dashboard/components/RecentOrders';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const [days, setDays] = useState(30);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { data, loading, error } = useQuery(GET_DASHBOARD_STATS, {
    variables: { days, timezone },
    fetchPolicy: 'network-only',
  });

  const stats = data?.dashboardStats;

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-sky-900">Dashboard</h1>
          <p className="mt-2 text-gray-700">Overview of your e-commerce store</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Period:</label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent min-w-[140px]"
          >
            <option value={1}>Today</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Revenue"
              value={`€${stats?.totalRevenue?.toFixed(2) || '0.00'}`}
              icon={DollarSign}
              change={stats?.revenueChange}
              iconBgColor="bg-green-100"
              iconColor="text-green-700"
            />
            <StatCard
              title="Total Orders"
              value={stats?.totalOrders || 0}
              icon={ShoppingCart}
              change={stats?.ordersChange}
              iconBgColor="bg-blue-100"
              iconColor="text-blue-700"
            />
            <StatCard
              title="Average Order Value"
              value={`€${stats?.averageOrderValue?.toFixed(2) || '0.00'}`}
              icon={TrendingUp}
              iconBgColor="bg-amber-100"
              iconColor="text-amber-700"
            />
            <StatCard
              title="Total Products"
              value={stats?.totalProducts || 0}
              icon={Package}
              iconBgColor="bg-sky-100"
              iconColor="text-sky-700"
            />
            <StatCard
              title="Low Stock Items"
              value={stats?.lowStockCount || 0}
              icon={AlertTriangle}
              iconBgColor="bg-red-100"
              iconColor="text-red-700"
            />
            <StatCard
              title="New Customers"
              value={stats?.totalCustomers || 0}
              icon={Users}
              change={stats?.customersChange}
              iconBgColor="bg-purple-100"
              iconColor="text-purple-700"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart data={stats?.revenueByDay || []} />
            <OrderStatusChart data={stats?.ordersByStatus || []} />
          </div>

          <RecentOrders orders={stats?.recentOrders || []} />
        </>
      )}
    </div>
  );
}
