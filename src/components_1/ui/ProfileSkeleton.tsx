export default function ProfileSkeleton() {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-300 w-1/3 mb-2 rounded"></div>
          <div className="h-4 bg-gray-300 w-1/2 rounded"></div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="h-20 bg-gray-300 rounded"></div>
        <div className="h-20 bg-gray-300 rounded"></div>
        <div className="h-20 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
}
