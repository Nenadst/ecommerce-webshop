'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';

import { ConfirmModal } from '@/shared/components/modals/ConfirmModal';
import { Category } from '@/entities/category/types/category.types';
import { useAdminCategories } from '../hooks/useAdminCategories';
import FullScreenSpinner from '@/shared/components/spinner/FullScreenSpinner';
import { DataTable } from '@/shared/components/table/DataTable';

import type { ColumnDef } from '@tanstack/react-table';

export function AdminCategories() {
  const {
    categories,
    loading,
    modal,
    setModal,
    handleAddCategory,
    handleDeleteCategory,
    deleteLoading,
  } = useAdminCategories();

  const columns = useMemo<ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: (info) => info.getValue(),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const cat = row.original;
          return (
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/categories/${cat.id}/edit`}
                className="text-blue-600  hover:text-red-600"
              >
                <Pencil size={16} />
              </Link>
              <button
                onClick={() => handleDeleteCategory(cat.id)}
                className="text-sky-900 hover:text-red-600"
                disabled={deleteLoading}
                aria-label="Delete category"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        },
      },
    ],
    [handleDeleteCategory, deleteLoading]
  );

  if (loading) return <FullScreenSpinner />;

  return (
    <div className="p-6 space-y-10">
      <ConfirmModal
        show={modal.show}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal((prev) => ({ ...prev, show: false }))}
        deleteLoading={deleteLoading}
      />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-sky-900">Categories</h2>
        <button
          onClick={() => handleAddCategory()}
          className="bg-sky-900 text-white px-4 py-2 rounded hover:bg-sky-800"
        >
          + Add New Category
        </button>
      </div>

      <DataTable data={categories} columns={columns} />
    </div>
  );
}
