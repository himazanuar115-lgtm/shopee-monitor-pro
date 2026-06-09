'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Store } from '@/types/store';
import { BarChart3, ShoppingCart, Package, MessageSquare, Zap, Globe } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import Chart from '@/components/dashboard/Chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RecentOrders from '@/components/dashboard/RecentOrders';
import RecentChats from '@/components/dashboard/RecentChats';
import LowStockProducts from '@/components/dashboard/LowStockProducts';

export default function DashboardPage() {
  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const response = await axios.get('/api/stores');
      return response.data as Store[];
    },
  });

  const totals = useMemo(
    () => ({
      revenue: stores.reduce((sum, store) => sum + store.totalRevenue, 0),
      orders: stores.reduce((sum, store) => sum + store.totalOrders, 0),
      products: stores.reduce((sum, store) => sum + store.totalProducts, 0),
      chats: stores.reduce((sum, store) => sum + store.totalChats, 0),
      visitors: stores.reduce((sum, store) => sum + store.totalVisitors, 0),
      conversionRate:
        stores.length > 0
          ? stores.reduce((sum, store) => sum + store.conversionRate, 0) / stores.length
          : 0,
      avgRating:
        stores.length > 0
          ? stores.reduce((sum, store) => sum + store.rating, 0) / stores.length
          : 0,
    }),
    [stores]
  );

  const performanceData = useMemo(
    () => stores.slice(0, 6).map((store) => ({ name: store.name, revenue: store.totalRevenue })),
    [stores]
  );

  const chartData = [
    { name: 'Senin', revenue: 12000, orders: 24 },
    { name: 'Selasa', revenue: 19000, orders: 35 },
    { name: 'Rabu', revenue: 15000, orders: 28 },
    { name: 'Kamis', revenue: 22000, orders: 42 },
    { name: 'Jumat', revenue: 25000, orders: 48 },
    { name: 'Sabtu', revenue: 28000, orders: 52 },
    { name: 'Minggu', revenue: 32000, orders: 61 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <h1 className="text-3xl font-bold text-emphasis">Dashboard</h1>
          <p className="mt-2 text-muted">Pantau omzet, pesanan, produk, dan performa toko secara realtime.</p>
        </div>
        <div className="flex items-center justify-start md:justify-end xl:justify-center gap-2">
          <div className="surface-glass px-4 py-3 text-sm text-muted">
            Total Toko: <span className="font-semibold text-emphasis">{stores.length}</span>
          </div>
          <div className="surface-glass px-4 py-3 text-sm text-muted">
            Pengunjung: <span className="font-semibold text-emphasis">{totals.visitors.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Omzet"
          value={`Rp${(totals.revenue / 1000000).toFixed(1)}M`}
          trend={{ value: 18, isPositive: true }}
          icon={BarChart3}
        />
        <StatCard
          title="Total Pesanan"
          value={totals.orders}
          description="Dari semua toko"
          trend={{ value: 12, isPositive: true }}
          icon={ShoppingCart}
        />
        <StatCard
          title="Produk Aktif"
          value={totals.products}
          description="Stok dan listing"
          trend={{ value: 5, isPositive: true }}
          icon={Package}
        />
        <StatCard
          title="Rating Rata-rata"
          value={totals.avgRating.toFixed(1)}
          description="Skor toko premium"
          icon={MessageSquare}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="surface-glass">
          <CardHeader>
            <CardTitle className="text-base">Conversion Rate</CardTitle>
            <CardDescription>Rata-rata performa konversi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="surface-icon p-4">
                <Zap size={28} />
              </div>
              <div>
                <p className="text-4xl font-semibold text-emphasis">{totals.conversionRate.toFixed(1)}%</p>
                <p className="text-sm text-muted">Kinerja konversi keseluruhan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="surface-glass">
          <CardHeader>
            <CardTitle className="text-base">Traffic Toko</CardTitle>
            <CardDescription>Aggregate pengunjung</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="surface-icon p-4">
                <Globe size={28} />
              </div>
              <div>
                <p className="text-4xl font-semibold text-emphasis">{totals.visitors.toLocaleString('id-ID')}</p>
                <p className="text-sm text-muted">Total pengunjung bulan ini</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <LowStockProducts />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart
          title="Grafik Omzet"
          description="Ringkasan omzet harian"
          data={chartData}
          type="line"
          dataKey="revenue"
          xAxisKey="name"
        />
        <Chart
          title="Grafik Penjualan"
          description="Pesanan per hari"
          data={chartData}
          type="bar"
          dataKey="orders"
          xAxisKey="name"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentOrders />
        <div className="lg:col-span-2">
          <Chart
            title="Grafik Performa Toko"
            description="Omzet unggulan dari tiap toko"
            data={performanceData}
            type="pie"
            dataKey="revenue"
            xAxisKey="name"
          />
        </div>
      </div>

      <RecentChats />
    </div>
  );
}
