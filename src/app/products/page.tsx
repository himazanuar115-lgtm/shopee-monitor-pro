'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Plus, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Product } from '@/types/product';
import { Store } from '@/types/store';
import { formatCurrency } from '@/lib/utils';
import ProductCreateDialog from '@/components/products/ProductCreateDialog';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await axios.get('/api/products?limit=200');
      return response.data;
    },
  });

  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const response = await axios.get('/api/stores');
      return response.data;
    },
  });

  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());
    const matchesStore = storeFilter === 'ALL' || product.storeId === storeFilter;
    const matchesStock =
      stockFilter === 'ALL' ||
      (stockFilter === 'LOW' && product.isLowStock) ||
      (stockFilter === 'OUT' && product.status === 'OUT_OF_STOCK') ||
      (stockFilter === 'OK' && !product.isLowStock && product.status !== 'OUT_OF_STOCK');
    return matchesSearch && matchesStore && matchesStock;
  });

  const lowStockCount = products.filter((p: any) => p.isLowStock).length;
  const outOfStockCount = products.filter((p: any) => p.status === 'OUT_OF_STOCK').length;

  const getStockBadge = (product: any) => {
    if (product.status === 'OUT_OF_STOCK') return 'surface-badge-danger';
    if (product.isLowStock) return 'surface-badge-warning';
    return 'surface-badge-success';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-emphasis">Produk</h1>
          <p className="mt-2 text-muted">Kelola semua produk dari toko Anda</p>
        </div>
        
        {/* Product create dialog */}
        <ProductCreateDialog
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          stores={stores}
        />
        
        {/* GANTI TOTAL DENGAN BUTTON HTML BIASA INI UNTUK selamanya */}
        <button
          type="button"
          onClick={() => {
            console.log("TOMBOL BERHASIL DIKLIK, BOS!");
            alert("Tombol berfungsi!");
            setIsAddOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-bold relative z-50"
        >
          <Plus className="mr-2 inline h-4 w-4" />
          Tambah Produk Baru
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="surface-glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted">Total Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emphasis">{products.length}</p>
          </CardContent>
        </Card>
        <Card className="surface-glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted">Stok Aman</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-system-success">
              {products.length - lowStockCount - outOfStockCount}
            </p>
          </CardContent>
        </Card>
        <Card className="surface-glass">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-system-warning" />
              <CardTitle className="text-sm text-muted">Stok Menipis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-system-warning">{lowStockCount}</p>
          </CardContent>
        </Card>
        <Card className="surface-glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted">Habis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-system-danger">{outOfStockCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="surface-glass">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                placeholder="Cari nama produk atau SKU..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semua Toko" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Toko</SelectItem>
                {stores.map((store: Store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semua Stok" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua</SelectItem>
                <SelectItem value="OK">Stok Aman</SelectItem>
                <SelectItem value="LOW">Stok Menipis</SelectItem>
                <SelectItem value="OUT">Habis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="surface-glass">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Toko</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                  <TableHead className="text-right">Terjual</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product: any) => {
                  const store = stores.find((s: Store) => s.id === product.storeId);
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium text-emphasis">
                        {product.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted">
                        {product.sku}
                      </TableCell>
                      <TableCell className="text-subtle">
                        {store?.name || '—'}
                      </TableCell>
                      <TableCell className="text-right font-medium text-emphasis">
                        {formatCurrency(product.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={getStockBadge(product)}>
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{product.sold}</TableCell>
                      <TableCell>
                        <Badge>
                          {product.status === 'ACTIVE' ? 'Aktif' : product.status === 'OUT_OF_STOCK' ? 'Habis' : product.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
