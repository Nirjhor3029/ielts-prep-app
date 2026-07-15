export function SkeletonCard() {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-surface-container-high rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-surface-container-high rounded w-3/4" />
          <div className="h-3 bg-surface-container rounded w-1/2" />
        </div>
        <div className="w-12 h-12 bg-surface-container-high rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonLine({ width = '100%' }: { width?: string }) {
  return <div className="h-4 bg-surface-container-high rounded animate-pulse" style={{ width }} />;
}

export function SkeletonCircle({ size = 48 }: { size?: number }) {
  return (
    <div
      className="bg-surface-container-high rounded-full animate-pulse"
      style={{ width: size, height: size }}
    />
  );
}
