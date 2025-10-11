'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface OrdersByStatus {
  status: string;
  count: number;
}

interface OrderStatusChartProps {
  data: OrdersByStatus[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  PROCESSING: '#3b82f6',
  SHIPPED: '#8b5cf6',
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function OrderStatusChart({ data }: OrderStatusChartProps) {
  const chartData = data.map((item) => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count,
    status: item.status,
  }));

  const totalOrders = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Orders by Status</h3>
      {totalOrders > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: { name?: string; percent?: number }) => {
                const percent = props.percent || 0;
                const name = props.name || '';
                return `${name}: ${(percent * 100).toFixed(0)}%`;
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.status}`}
                  fill={STATUS_COLORS[entry.status] || '#6b7280'}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value} orders`, 'Count']}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          No orders data available
        </div>
      )}
    </div>
  );
}
