'use client';

interface AdminProductsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export default function AdminProductsPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: AdminProductsPaginationProps) {
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <label htmlFor="limit" className="text-sm font-medium text-gray-700">
          Show:
        </label>
        <select
          id="limit"
          value={limit}
          onChange={(e) => {
            onLimitChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="border border-gray-300 rounded pl-3 pr-8 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none text-center"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg fill='none' stroke='%234B5563' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundSize: '0.75rem 0.75rem',
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        <span className="text-sm text-gray-600">products per page</span>
      </div>

      <div className="text-sm text-gray-600">
        Showing {startItem}-{endItem} of {total} results
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          First
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <span className="px-3 py-1 text-sm font-medium">
          Page {page} of {totalPages}
        </span>
        
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Last
        </button>
      </div>
    </div>
  );
}