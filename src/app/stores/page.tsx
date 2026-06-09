import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import StoresPageContent from './stores-content';

export default function StoresPage() {
  return (
    <Suspense fallback={<StoresPageSkeleton />}>
      <StoresPageContent />
    </Suspense>
  );
}

function StoresPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-emphasis">Toko</h1>
          <p className="mt-2 text-muted">Kelola hingga 10 toko Shopee Anda</p>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </div>
  );
}
