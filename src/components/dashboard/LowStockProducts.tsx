'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Product } from '@/types/product';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

export default function LowStockProducts() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['low-stock-products'],
    queryFn: async () => {
      const response = await axios.get('/api/products?filter=low_stock&limit=10');
      return response.data;
    },
  });

  return (
    <Card className="surface-destructive">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[hsl(var(--destructive))]" />
          <div>
            <CardTitle className="text-base">Stok Menipis</CardTitle>
            <CardDescription>
              {products.length} produk memiliki stok kurang
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-8 text-center text-muted">
            <p className="text-sm">Semua produk memiliki stok yang cukup</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.slice(0, 10).map((product: Product) => (
              <div
                key={product.id}
                className="surface-row surface-destructive flex items-center justify-between p-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-emphasis">{product.name}</p>
                  <p className="mt-1 text-xs text-muted">SKU: {product.sku}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-[hsl(var(--destructive))] text-sm">
                    {product.stock} unit
                  </p>
                  <p className="text-xs text-muted">Terjual: {product.sold}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {products.length > 0 && (
          <Link href="/products?filter=low_stock" className="block mt-4">
            <Button variant="outline" className="w-full">
              Lihat Semua
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
