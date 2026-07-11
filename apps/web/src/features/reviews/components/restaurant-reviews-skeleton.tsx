export default function RestaurantReviewsSkeleton() {
  return (
    <div className="my-6" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-4 my-3 shadow-sm animate-pulse">
          <div className="flex justify-between items-center">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-4 w-40 rounded bg-gray-200" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-3 w-full rounded bg-gray-200" />
            <div className="h-3 w-full rounded bg-gray-200" />
            <div className="h-3 w-2/3 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
