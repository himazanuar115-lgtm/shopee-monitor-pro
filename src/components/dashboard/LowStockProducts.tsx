'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Product } from '@/types/product';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <Card className="border-yellow-900/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
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
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">Semua produk memiliki stok yang cukup</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.slice(0, 10).map((product: Product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-yellow-950/20 rounded-lg border border-yellow-900/50"
              >
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">{product.name}</p>
                  <p className="text-xs text-slate-400 mt-1">SKU: {product.sku}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-yellow-400 text-sm">
                    {product.stock} unit
                  </p>
                  <p className="text-xs text-slate-400">Terjual: {product.sold}</p>
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
