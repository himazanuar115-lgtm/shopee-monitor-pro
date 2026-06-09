'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Store } from '@/types/store';
import { formatCurrency } from '@/lib/utils';
import { ORDER_STATUSES } from '@/lib/constants';

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [storeFilter, setStoreFilter] = useState('ALL');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await axios.get('/api/orders?limit=100');
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

  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch =
      !search ||
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.buyerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesStore = storeFilter === 'ALL' || order.storeId === storeFilter;
    return matchesSearch && matchesStatus && matchesStore;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'surface-badge-warning',
      PROCESSING: 'surface-badge-primary',
      SHIPPED: 'surface-badge-primary',
      DELIVERED: 'surface-badge-success',
      CANCELLED: 'surface-badge-danger',
      RETURNED: 'surface-badge-warning',
    };
    return colors[status] || 'surface-badge';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-emphasis">Pesanan</h1>
        <p className="mt-2 text-muted">Monitor semua pesanan dari toko Anda</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="surface-glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted">Total Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emphasis">{orders.length}</p>
          </CardContent>
        </Card>
        <Card className="surface-glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-system-warning">
              {orders.filter((o: any) => o.status === 'PENDING').length}
            </p>
          </CardContent>
        </Card>
        <Card className="surface-glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted">Diproses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-system-primary">
              {orders.filter((o: any) => o.status === 'PROCESSING').length}
            </p>
          </CardContent>
        </Card>
        <Card className="surface-glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted">Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-system-success">
              {orders.filter((o: any) => o.status === 'DELIVERED').length}
            </p>
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
                placeholder="Cari nomor pesanan atau pembeli..."
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                {Object.entries(ORDER_STATUSES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
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
                  <TableHead>Nomor Pesanan</TableHead>
                  <TableHead>Toko</TableHead>
                  <TableHead>Pembeli</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order: any) => {
                  const store = stores.find((s: Store) => s.id === order.storeId);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-emphasis">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell className="text-subtle">
                        {store?.name || '—'}
                      </TableCell>
                      <TableCell>{order.buyerName}</TableCell>
                      <TableCell className="text-subtle">
                        {order.items?.length || 0} item
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-emphasis">
                        {formatCurrency(order.totalAmount)}
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
