'use client';

import AdminProductsViewToggle, { ViewType } from './AdminProductsViewToggle';

interface AdminProductsViewControlsProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  totalProducts: number;
}

export default function AdminProductsViewControls({
  currentView,
  onViewChange,
  totalProducts,
}: AdminProductsViewControlsProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600">
        {totalProducts} {totalProducts === 1 ? 'product' : 'products'} found
      </div>
      <AdminProductsViewToggle currentView={currentView} onViewChange={onViewChange} />
    </div>
  );
}