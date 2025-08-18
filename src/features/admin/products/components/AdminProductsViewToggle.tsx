'use client';

import { Grid, List } from 'lucide-react';

export type ViewType = 'grid' | 'list';

interface AdminProductsViewToggleProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function AdminProductsViewToggle({
  currentView,
  onViewChange,
}: AdminProductsViewToggleProps) {
  return (
    <div className="flex items-center border border-gray-300 rounded-md p-0.5 bg-white">
      <button
        onClick={() => onViewChange('grid')}
        className={`flex items-center justify-center px-2 py-1.5 rounded-sm transition-colors ${
          currentView === 'grid'
            ? 'bg-sky-900 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        title="Grid View"
      >
        <Grid size={14} />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`flex items-center justify-center px-2 py-1.5 rounded-sm transition-colors ${
          currentView === 'list'
            ? 'bg-sky-900 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        title="List View"
      >
        <List size={14} />
      </button>
    </div>
  );
}
