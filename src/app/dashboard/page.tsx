'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Store } from '@/types/store';
import { BarChart3, ShoppingCart, Package, MessageSquare } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import Chart from '@/components/dashboard/Chart';
import RecentOrders from '@/components/dashboard/RecentOrders';
import RecentChats from '@/components/dashboard/RecentChats';
import LowStockProducts from '@/components/dashboard/LowStockProducts';

export default function DashboardPage() {
  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const response = await axios.get('/api/stores');
      return response.data;
    },
  });

  const totalRevenue = stores.reduce(
    (sum: number, store: Store) => sum + store.totalRevenue,
    0
  );
  const totalOrders = stores.reduce(
    (sum: number, store: Store) => sum + store.totalOrders,
    0
  );
  const totalProducts = stores.reduce(
    (sum: number, store: Store) => sum + store.totalProducts,
    0
  );
  const totalChats = stores.reduce(
    (sum: number, store: Store) => sum + store.totalChats,
    0
  );
  const avgRating =
    stores.length > 0
      ? (stores.reduce((sum: number, store: Store) => sum + store.rating, 0) /
          stores.length)
          .toFixed(2)
      : 0;

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
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-2">Selamat datang kembali!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Pendapatan"
          value={`Rp${(totalRevenue / 1000000).toFixed(1)}M`}
          trend={{ value: 12, isPositive: true }}
          icon={BarChart3}
        />
        <StatCard
          title="Total Pesanan"
          value={totalOrders}
          description="Bulan ini"
          trend={{ value: 8, isPositive: true }}
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Produk"
          value={totalProducts}
          description="Aktif di semua toko"
          trend={{ value: 5, isPositive: true }}
          icon={Package}
        />
        <StatCard
          title="Rating Rata-Rata"
          value={avgRating}
          description="Dari semua toko"
          icon={BarChart3}
        />
      </div>

      {/* Charts and Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart
          title="Pendapatan Minggu Ini"
          description="Statistik pendapatan harian"
          data={chartData}
          type="line"
          dataKey="revenue"
          xAxisKey="name"
        />
        <Chart
          title="Jumlah Pesanan"
          description="Total pesanan per hari"
          data={chartData}
          type="bar"
          dataKey="orders"
          xAxisKey="name"
        />
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
        <LowStockProducts />
      </div>

      <RecentChats />
    </div>
  );
}
