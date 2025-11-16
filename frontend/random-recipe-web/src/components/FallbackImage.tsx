export default function FallbackImage() {
  return (
    <div className="flex aspect-square h-full w-full items-center justify-center rounded-lg bg-gray-100 p-2">
      <div className="text-center text-gray-500">
        <span className="text-4xl">🍽️</span>
        <p className="mt-1 text-xs">No image available</p>
      </div>
    </div>
  )
}
