export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-gray-200 h-[520px] rounded-lg animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}
