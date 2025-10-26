'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_USER_ACTIVITY_LOGS } from '@/shared/graphql/queries/activity.queries';
import { Download, Activity, Calendar, X } from 'lucide-react';
import Button from '@/shared/components/elements/Button';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface ActivityLog {
  id: string;
  userId: string | null;
  userName: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  action: string;
  description: string;
  ipAddress: string | null;
  userAgent: string | null;
  path: string | null;
  metadata: string | null;
  createdAt: string;
}

export default function TrackUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { isAuthenticated, isAdmin } = useAuth();

  // Initialize date range: default to last 7 days
  const getDefaultDates = () => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    return {
      from: sevenDaysAgo.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0],
    };
  };

  const [dateRange, setDateRange] = useState(getDefaultDates());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

  const { data, loading, error } = useQuery(GET_USER_ACTIVITY_LOGS, {
    variables: {
      userId,
      limit: 10000,
      fromDate: dateRange.from,
      toDate: dateRange.to,
    },
    skip: !isAuthenticated || !isAdmin,
  });

  const handleDateChange = (type: 'from' | 'to', value: string) => {
    setDateRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleClearFilter = () => {
    setDateRange({
      from: '',
      to: '',
    });
  };

  const handleQuickFilter = (
    type: 'today' | 'yesterday' | 'week' | '30days' | 'month' | 'year'
  ) => {
    const today = new Date();
    const to = today.toISOString().split('T')[0];
    let from = '';

    switch (type) {
      case 'today':
        from = to;
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        from = yesterday.toISOString().split('T')[0];
        setDateRange({ from, to: from });
        return;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        from = weekAgo.toISOString().split('T')[0];
        break;
      case '30days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        from = thirtyDaysAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        from = firstDayOfMonth.toISOString().split('T')[0];
        break;
      case 'year':
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        from = firstDayOfYear.toISOString().split('T')[0];
        break;
    }

    setDateRange({ from, to });
  };

  const downloadAsText = () => {
    if (!data?.userActivityLogs) return;

    const logs: ActivityLog[] = data.userActivityLogs;
    let textContent = `Activity Log for User ID: ${userId}\n`;
    textContent += `User: ${logs[0]?.user?.name || 'Unknown'} (${logs[0]?.user?.email || 'N/A'})\n`;
    if (dateRange.from && dateRange.to) {
      textContent += `Date Range: ${new Date(dateRange.from).toLocaleDateString()} to ${new Date(dateRange.to).toLocaleDateString()}\n`;
    } else if (dateRange.from) {
      textContent += `Date Range: From ${new Date(dateRange.from).toLocaleDateString()}\n`;
    } else if (dateRange.to) {
      textContent += `Date Range: Until ${new Date(dateRange.to).toLocaleDateString()}\n`;
    } else {
      textContent += `Date Range: All time\n`;
    }
    textContent += `Total Activities: ${logs.length}\n`;
    textContent += `Generated: ${new Date().toLocaleString()}\n`;
    textContent += `\n${'='.repeat(100)}\n\n`;

    logs.forEach((log, index) => {
      textContent += `[${index + 1}] Activity Log\n`;
      textContent += `${'-'.repeat(100)}\n`;
      textContent += `ID: ${log.id}\n`;
      textContent += `User: ${log.userName || log.user?.name || 'Guest'}\n`;
      textContent += `Action: ${log.action}\n`;
      textContent += `Description: ${log.description}\n`;
      textContent += `Date/Time: ${new Date(log.createdAt).toLocaleString()}\n`;
      if (log.path) textContent += `Path: ${log.path}\n`;
      if (log.ipAddress) textContent += `IP Address: ${log.ipAddress}\n`;
      if (log.userAgent) textContent += `User Agent: ${log.userAgent}\n`;
      if (log.metadata) {
        textContent += `Metadata: ${log.metadata}\n`;
      }
      textContent += `\n`;
    });

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${userId}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Logs</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  const logs: ActivityLog[] = data?.userActivityLogs || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-sky-600" />
              <div>
                <h1 className="text-3xl font-bold text-sky-900">User Activity Tracker</h1>
                {logs[0]?.user && (
                  <p className="text-gray-600 mt-1">
                    Tracking:{' '}
                    <span className="font-semibold">{logs[0].user.name || 'Unknown'}</span> (
                    {logs[0].user.email})
                  </p>
                )}
                <p className="text-sm text-gray-500">User ID: {userId}</p>
              </div>
            </div>
            <Button
              onClick={downloadAsText}
              className="flex items-center gap-2 bg-sky-900 hover:bg-sky-800 text-white px-6 py-3 rounded-lg transition-colors"
              disabled={logs.length === 0}
            >
              <Download className="w-5 h-5" />
              Download as Text File
            </Button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-700">Filter by Date Range</h3>
            </div>
            <div className="flex flex-wrap items-end gap-3 mb-3">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => handleDateChange('from', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => handleDateChange('to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleQuickFilter('today')}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-xs transition-colors"
              >
                Today
              </Button>
              <Button
                onClick={() => handleQuickFilter('yesterday')}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-xs transition-colors"
              >
                Yesterday
              </Button>
              <Button
                onClick={() => handleQuickFilter('week')}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-xs transition-colors"
              >
                This Week
              </Button>
              <Button
                onClick={() => handleQuickFilter('30days')}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-xs transition-colors"
              >
                30 Days
              </Button>
              <Button
                onClick={() => handleQuickFilter('month')}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-xs transition-colors"
              >
                This Month
              </Button>
              <Button
                onClick={() => handleQuickFilter('year')}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-xs transition-colors"
              >
                This Year
              </Button>
              <Button
                onClick={handleClearFilter}
                className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-xs transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear Filter
              </Button>
            </div>

            {dateRange.from && dateRange.to && (
              <p className="text-xs text-gray-500 mt-3">
                Showing activities from {new Date(dateRange.from).toLocaleDateString()} to{' '}
                {new Date(dateRange.to).toLocaleDateString()}
              </p>
            )}
            {!dateRange.from && !dateRange.to && (
              <p className="text-xs text-gray-500 mt-3">
                Showing all activities (no date filter applied)
              </p>
            )}
          </div>

          <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-6">
            <p className="text-sky-900 font-semibold">
              Total Activities: <span className="text-2xl">{logs.length}</span>
            </p>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Activity Logs Found</h2>
            <p className="text-gray-500">This user has no recorded activities yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sky-900 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Date/Time</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Path</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">IP Address</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log, index) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {log.userName || log.user?.name || 'Guest'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                        {log.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {log.path || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{log.ipAddress || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        {log.metadata && (
                          <details className="cursor-pointer">
                            <summary className="text-sky-600 hover:text-sky-700 font-medium">
                              View
                            </summary>
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs max-w-xs overflow-auto">
                              {log.metadata}
                            </div>
                          </details>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
