'use client';

import { useState } from 'react';
import ConfirmModal from '@/shared/components/modals/ConfirmModal';
import { useAdminProducts } from '../hooks/useAminProducts';
import AdminProductsFilters from './AdminProductsFilters';
import AdminProductsGrid from './AdminProductsGrid';
import AdminProductsList from './AdminProductsList';
import AdminProductsHeader from './AdminProductsHeader';
import AdminProductsPagination from './AdminProductsPagination';
import AdminProductsViewControls from './AdminProductsViewControls';
import { ViewType } from './AdminProductsViewToggle';

export default function AdminProducts() {
  const [currentView, setCurrentView] = useState<ViewType>('grid');

  const {
    products,
    totalPages,
    total,
    page,
    setPage,
    setSort,
    modal,
    setModal,
    deleteLoading,
    handleDeleteProduct,
    handleAddProduct,
    productsLoading,
    search,
    setSearch,
    categoryId,
    setCategoryId,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    limit,
    setLimit,
  } = useAdminProducts();

  return (
    <div className="space-y-6">
      <AdminProductsHeader totalProducts={total} onAddProduct={handleAddProduct} onSort={setSort} />

      <AdminProductsFilters
        search={search}
        setSearch={setSearch}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
      />

      <AdminProductsViewControls
        currentView={currentView}
        onViewChange={setCurrentView}
        totalProducts={total}
      />

      {currentView === 'grid' ? (
        <AdminProductsGrid
          products={products}
          loading={productsLoading}
          deleteLoading={deleteLoading}
          onDeleteProduct={handleDeleteProduct}
          onAddProduct={handleAddProduct}
        />
      ) : (
        <AdminProductsList
          products={products}
          loading={productsLoading}
          deleteLoading={deleteLoading}
          onDeleteProduct={handleDeleteProduct}
          onAddProduct={handleAddProduct}
        />
      )}

      {total > 0 && (
        <AdminProductsPagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      )}

      {modal.show && (
        <ConfirmModal
          isOpen={modal.show}
          title="Confirm Delete"
          message={modal.message}
          onConfirm={() => {
            modal.onConfirm();
            setModal((prev) => ({ ...prev, show: false }));
          }}
          onClose={() => setModal((prev) => ({ ...prev, show: false }))}
          confirmText="Delete"
          cancelText="Cancel"
          isLoading={deleteLoading}
        />
      )}
    </div>
  );
}
