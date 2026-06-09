'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Store as StoreIcon,
  Plus,
  RefreshCw,
  Star,
  ShoppingCart,
  DollarSign,
  Package,
  Link2,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Store } from '@/types/store';
import { formatCurrency } from '@/lib/utils';

export default function StoresPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStore, setNewStore] = useState({ name: '', shopeeId: '', apiKey: '', apiSecret: '' });
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [syncingStoreId, setSyncingStoreId] = useState<string | null>(null);

  // ── URL state handling ──
  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (connected === 'true') {
      setBanner({ type: 'success', message: 'Toko berhasil terhubung dengan Shopee!' });
      // Clean URL
      router.replace('/stores');
    } else if (error) {
      const errorMessages: Record<string, string> = {
        denied: 'Anda menolak pemberian izin ke Shopee.',
        missing_code: 'Kode otorisasi tidak diterima dari Shopee.',
        invalid_state: 'Keamanan sesi gagal. Silakan coba lagi.',
        token_exchange: 'Gagal menukar kode otorisasi dengan token.',
        config: 'Integrasi Shopee belum dikonfigurasi.',
        incomplete_response: 'Respons token dari Shopee tidak lengkap.',
        internal: 'Terjadi kesalahan tak terduga.',
      };
      const displayMessage = message || errorMessages[error] || `Error: ${error}`;
      setBanner({ type: 'error', message: displayMessage });
      router.replace('/stores');
    }
  }, [searchParams, router]);

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const response = await axios.get('/api/stores');
      return response.data;
    },
  });

  const addStoreMutation = useMutation({
    mutationFn: async (data: typeof newStore) => {
      return axios.post('/api/stores', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setIsAddDialogOpen(false);
      setNewStore({ name: '', shopeeId: '', apiKey: '', apiSecret: '' });
    },
  });

  const handleAddStore = () => {
    addStoreMutation.mutate(newStore);
  };

  const handleConnectShopee = () => {
    router.push('/api/shopee/connect');
  };

  const syncProductsMutation = useMutation({
    mutationFn: async (storeId: string) => {
      return axios.post('/api/products', { storeId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSyncingStoreId(null);
      setBanner({ type: 'success', message: 'Produk berhasil disinkronkan!' });
      setTimeout(() => setBanner(null), 5000);
    },
    onError: (error: any) => {
      setSyncingStoreId(null);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal menyinkronkan produk';
      setBanner({ type: 'error', message: errorMessage });
    },
  });

  const handleSyncStore = (storeId: string) => {
    setSyncingStoreId(storeId);
    syncProductsMutation.mutate(storeId);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'surface-badge-success',
      INACTIVE: 'surface-badge',
      SUSPENDED: 'surface-badge-danger',
      PENDING: 'surface-badge-warning',
    };
    return styles[status] || styles.INACTIVE;
  };

  return (
    <div className="space-y-6">
      {/* ── Banner ── */}
      {banner && (
        <div
          className={`surface-glass flex items-center gap-3 rounded-lg border-2 p-4 ${
            banner.type === 'success'
              ? 'border-system-success bg-system-success/10'
              : 'border-system-danger bg-system-danger/10'
          }`}
        >
          {banner.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-system-success" />
          ) : (
            <AlertCircle className="h-5 w-5 text-system-danger" />
          )}
          <p className="flex-1 text-sm font-medium text-emphasis">{banner.message}</p>
          <button
            onClick={() => setBanner(null)}
            className="text-muted hover:text-emphasis transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-emphasis">Toko</h1>
          <p className="mt-2 text-muted">Kelola hingga 10 toko Shopee Anda</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleConnectShopee} className="gap-2">
            <Link2 className="h-4 w-4" />
            Hubungkan Shopee
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={stores.length >= 10}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Manual
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Toko Baru</DialogTitle>
                <DialogDescription>
                  Hubungkan toko Shopee Anda untuk monitoring
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nama Toko</Label>
                  <Input
                    placeholder="Nama toko"
                    value={newStore.name}
                    onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shopee ID</Label>
                  <Input
                    placeholder="SHOP-XXXX"
                    value={newStore.shopeeId}
                    onChange={(e) => setNewStore({ ...newStore, shopeeId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    placeholder="API Key"
                    value={newStore.apiKey}
                    onChange={(e) => setNewStore({ ...newStore, apiKey: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Secret</Label>
                  <Input
                    type="password"
                    placeholder="API Secret"
                    value={newStore.apiSecret}
                    onChange={(e) => setNewStore({ ...newStore, apiSecret: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleAddStore} disabled={addStoreMutation.isPending}>
                  {addStoreMutation.isPending ? 'Menyimpan...' : 'Tambah'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Store Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store: Store) => {
            const connection = store.shopeeConnections?.[0];

            return (
              <Card
                key={store.id}
                className="surface-glass relative transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="surface-icon flex h-10 w-10 items-center justify-center">
                        <StoreIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{store.name}</CardTitle>
                        <CardDescription>
                          {connection
                            ? `Shop ID: ${connection.shopId}`
                            : `ID: ${store.shopeeId}`}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusBadge(store.status)}>
                      {store.status === 'ACTIVE'
                        ? 'Aktif'
                        : store.status === 'PENDING'
                          ? 'Pending'
                          : store.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Connection info */}
                  {connection && (
                    <div className="mb-4 rounded-md border-2 border-system-success/30 bg-system-success/5 p-3">
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-system-success" />
                        <span className="text-sm font-medium text-emphasis">
                          {connection.shopName}
                        </span>
                        <div
                          className={`ml-auto h-2 w-2 rounded-full ${
                            connection.isActive
                              ? 'surface-dot-success'
                              : 'surface-dot-danger'
                          }`}
                        />
                        <span className="text-xs text-muted">
                          {connection.isActive ? 'Terhubung' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-system-warning" />
                      <div>
                        <p className="text-xs text-muted">Rating</p>
                        <p className="text-sm font-semibold text-emphasis">
                          {store.rating.toFixed(1)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-system-primary" />
                      <div>
                        <p className="text-xs text-muted">Pesanan</p>
                        <p className="text-sm font-semibold text-emphasis">
                          {store.totalOrders}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-system-success" />
                      <div>
                        <p className="text-xs text-muted">Omzet</p>
                        <p className="text-sm font-semibold text-emphasis">
                          {formatCurrency(store.totalRevenue)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-system-primary" />
                      <div>
                        <p className="text-xs text-muted">Produk</p>
                        <p className="text-sm font-semibold text-emphasis">
                          {store.totalProducts}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between border-t surface-divider pt-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          store.isConnected ? 'surface-dot-success' : 'surface-dot-danger'
                        }`}
                      />
                      <span className="text-xs text-muted">
                        {store.isConnected ? 'Terhubung' : 'Offline'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-system-primary"
                      onClick={() => handleSyncStore(store.id)}
                      disabled={syncingStoreId === store.id || syncProductsMutation.isPending}
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${syncingStoreId === store.id ? 'animate-spin' : ''}`} />
                      {syncingStoreId === store.id ? 'Syncing...' : 'Sync'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
