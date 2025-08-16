interface AdminProductsHeaderProps {
  totalProducts: number;
  onAddProduct: () => void;
  onSort: (sort: { field: string; order: 1 | -1 }) => void;
}

export default function AdminProductsHeader({
  totalProducts,
  onAddProduct,
  onSort,
}: AdminProductsHeaderProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sky-900">Products</h1>
          <p className="text-gray-600 mt-1">
            Manage your product catalog ({totalProducts} products)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              onChange={(e) => {
                const [field, order] = e.target.value.split(':');
                onSort({ field, order: parseInt(order) as 1 | -1 });
              }}
              className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="createdAt:-1">Newest First</option>
              <option value="createdAt:1">Oldest First</option>
              <option value="price:1">Price: Low to High</option>
              <option value="price:-1">Price: High to Low</option>
              <option value="name:1">Name A-Z</option>
              <option value="name:-1">Name Z-A</option>
            </select>
          </div>

          <button
            onClick={onAddProduct}
            className="bg-sky-900 text-white px-4 py-2 rounded-md hover:bg-sky-800 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <span className="text-lg">+</span>
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
}
