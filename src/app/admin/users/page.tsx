'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_ALL_USERS,
  UPDATE_USER_ROLE,
  UPDATE_ACCOUNT_STATUS,
  DELETE_USER,
} from '@/entities/user/api/user.queries';
import {
  Search,
  UserCog,
  Trash2,
  Shield,
  User as UserIcon,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpDown,
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  accountStatus: string;
  lastLogin: string | null;
  country: string | null;
  createdAt: string;
}

const columnHelper = createColumnHelper<User>();

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingStatus, setEditingStatus] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const { data, loading, refetch } = useQuery(GET_ALL_USERS, {
    fetchPolicy: 'network-only',
  });

  const [updateUserRole] = useMutation(UPDATE_USER_ROLE);
  const [updateAccountStatus] = useMutation(UPDATE_ACCOUNT_STATUS);
  const [deleteUser] = useMutation(DELETE_USER);

  const users: User[] = data?.allUsers || [];

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateUserRole({
        variables: { id: userId, role: newRole },
      });
      await refetch();
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      await updateAccountStatus({
        variables: { id: userId, status: newStatus },
      });
      await refetch();
      setEditingStatus(null);
    } catch (error) {
      console.error('Error updating account status:', error);
      alert('Failed to update account status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser({
        variables: { id: userId },
      });
      await refetch();
      setDeletingUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatLastLogin = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return formatDate(dateString);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'inactive':
        return <XCircle className="w-3 h-3 mr-1" />;
      case 'suspended':
        return <AlertCircle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'User',
        cell: (info) => (
          <div className="text-sm font-medium text-gray-900">{info.getValue() || 'N/A'}</div>
        ),
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => <div className="text-sm text-gray-900">{info.getValue()}</div>,
      }),
      columnHelper.accessor('role', {
        header: 'Role',
        cell: (info) => {
          const role = info.getValue();
          return (
            <span
              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {role === 'admin' ? (
                <Shield className="w-3 h-3 mr-1" />
              ) : (
                <UserIcon className="w-3 h-3 mr-1" />
              )}
              {role.toUpperCase()}
            </span>
          );
        },
      }),
      columnHelper.accessor('accountStatus', {
        header: 'Status',
        cell: (info) => {
          const user = info.row.original;
          return (
            <button
              onClick={() => setEditingStatus(user)}
              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full hover:opacity-80 transition ${getStatusColor(
                info.getValue()
              )}`}
            >
              {getStatusIcon(info.getValue())}
              {info.getValue().toUpperCase()}
            </button>
          );
        },
      }),
      columnHelper.accessor('lastLogin', {
        header: 'Last Activity',
        cell: (info) => (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="w-3 h-3" />
            {formatLastLogin(info.getValue())}
          </div>
        ),
      }),
      columnHelper.accessor('country', {
        header: 'Country',
        cell: (info) => (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="w-3 h-3" />
            {info.getValue() || 'N/A'}
          </div>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Joined',
        cell: (info) => <div className="text-sm text-gray-500">{formatDate(info.getValue())}</div>,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const user = info.row.original;
          return (
            <div className="space-x-2">
              <button
                onClick={() => setEditingUser(user)}
                className="text-sky-600 hover:text-sky-900 inline-flex items-center"
                title="Change Role"
              >
                <UserCog className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeletingUser(user)}
                className="text-red-600 hover:text-red-900 inline-flex items-center"
                title="Delete User"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        },
      }),
    ],
    [setEditingUser, setEditingStatus, setDeletingUser]
  );

  const filteredData = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'all' || user.role.toLowerCase() === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, selectedRole]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-sky-900">Manage Users</h1>
        <p className="mt-2 text-gray-700">View and manage all registered users</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-sky-500 focus:border-transparent min-w-[130px]"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-900"></div>
          </div>
        ) : table.getRowModel().rows.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No users found matching your criteria
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              header.column.getCanSort()
                                ? 'cursor-pointer select-none flex items-center gap-1'
                                : ''
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && <ArrowUpDown className="w-3 h-3" />}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Change User Role</h3>
            <p className="text-sm text-gray-600 mb-4">
              Update role for <span className="font-semibold">{editingUser.email}</span>
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleUpdateRole(editingUser.id, 'USER')}
                className={`w-full px-4 py-3 rounded-lg border-2 transition ${
                  editingUser.role === 'user'
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-gray-200 hover:border-sky-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserIcon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">User</div>
                    <div className="text-xs text-gray-500">Regular user access</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleUpdateRole(editingUser.id, 'ADMIN')}
                className={`w-full px-4 py-3 rounded-lg border-2 transition ${
                  editingUser.role === 'admin'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">Admin</div>
                    <div className="text-xs text-gray-500">Full system access</div>
                  </div>
                </div>
              </button>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-red-600 mb-4">Delete User</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete{' '}
              <span className="font-semibold">{deletingUser.email}</span>? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingUser(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deletingUser.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {editingStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Change Account Status</h3>
            <p className="text-sm text-gray-600 mb-4">
              Update account status for <span className="font-semibold">{editingStatus.email}</span>
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleUpdateStatus(editingStatus.id, 'ACTIVE')}
                className={`w-full px-4 py-3 rounded-lg border-2 transition ${
                  editingStatus.accountStatus === 'active'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="text-left">
                    <div className="font-semibold">Active</div>
                    <div className="text-xs text-gray-500">
                      Full access - can login and create orders
                    </div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleUpdateStatus(editingStatus.id, 'INACTIVE')}
                className={`w-full px-4 py-3 rounded-lg border-2 transition ${
                  editingStatus.accountStatus === 'inactive'
                    ? 'border-gray-500 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <div className="font-semibold">Inactive</div>
                    <div className="text-xs text-gray-500">Can login but cannot create orders</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleUpdateStatus(editingStatus.id, 'SUSPENDED')}
                className={`w-full px-4 py-3 rounded-lg border-2 transition ${
                  editingStatus.accountStatus === 'suspended'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div className="text-left">
                    <div className="font-semibold">Suspended</div>
                    <div className="text-xs text-gray-500">
                      Account blocked - cannot login or create orders
                    </div>
                  </div>
                </div>
              </button>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEditingStatus(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
