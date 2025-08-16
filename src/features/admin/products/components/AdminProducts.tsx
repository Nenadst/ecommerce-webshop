'use client';

import { ConfirmModal } from '@/shared/components/modals/ConfirmModal';
import { useAdminProducts } from '../hooks/useAminProducts';
import AdminProductsFilters from './AdminProductsFilters';
import AdminProductsGrid from './AdminProductsGrid';
import AdminProductsHeader from './AdminProductsHeader';
import AdminProductsPagination from './AdminProductsPagination';

export default function AdminProducts() {
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

      <AdminProductsGrid
        products={products}
        loading={productsLoading}
        deleteLoading={deleteLoading}
        onDeleteProduct={handleDeleteProduct}
        onAddProduct={handleAddProduct}
      />

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
          show={modal.show}
          message={modal.message}
          onConfirm={() => {
            modal.onConfirm();
            setModal((prev) => ({ ...prev, show: false }));
          }}
          onCancel={() => setModal((prev) => ({ ...prev, show: false }))}
          deleteLoading={deleteLoading}
        />
      )}
    </div>
  );
}
