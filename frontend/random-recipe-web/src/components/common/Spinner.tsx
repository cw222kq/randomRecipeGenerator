export default function Spinner() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />
      <p className="ml-3 text-sm font-medium text-gray-900">Loading...</p>
    </div>
  )
}
