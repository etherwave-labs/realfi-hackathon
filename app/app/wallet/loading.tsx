export default function WalletLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="h-10 bg-muted rounded-lg w-48 mb-2 animate-pulse" />
        <div className="h-4 bg-muted rounded w-64 animate-pulse" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Wallet Address Skeleton */}
        <div className="md:col-span-2 border rounded-lg p-6 space-y-4">
          <div className="h-6 bg-muted rounded w-40 animate-pulse" />
          <div className="h-12 bg-muted rounded animate-pulse" />
          <div className="flex items-center justify-center p-6 bg-white rounded-lg">
            <div className="h-52 w-52 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Balance Cards Skeleton */}
        <div className="border rounded-lg p-6 space-y-4">
          <div className="h-6 bg-muted rounded w-32 animate-pulse" />
          <div className="h-12 bg-muted rounded w-48 animate-pulse" />
          <div className="h-10 bg-muted rounded animate-pulse" />
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <div className="h-6 bg-muted rounded w-32 animate-pulse" />
          <div className="h-12 bg-muted rounded w-48 animate-pulse" />
          <div className="h-10 bg-muted rounded animate-pulse" />
        </div>

        {/* Quick Actions Skeleton */}
        <div className="md:col-span-2 border rounded-lg p-6 space-y-4">
          <div className="h-6 bg-muted rounded w-36 animate-pulse" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-10 bg-muted rounded animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

