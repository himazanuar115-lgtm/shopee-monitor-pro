'use client';

import { useMemo, useState } from 'react';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import { Store } from '@/types/store';

export type ProductCreateFormState = {
  name: string;
  sku: string;
  price: string;
  stock: string;
  storeId: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stores: Store[];
  defaultStoreId?: string;
};

export default function ProductCreateDialog({
  open,
  onOpenChange,
  stores,
  defaultStoreId,
}: Props) {
  const queryClient = useQueryClient();

  const initialState = useMemo<ProductCreateFormState>(
    () => ({
      name: '',
      sku: '',
      price: '',
      stock: '',
      storeId: defaultStoreId || (stores[0]?.id ?? ''),
    }),
    [defaultStoreId, stores]
  );

  const [form, setForm] = useState<ProductCreateFormState>(initialState);
  const [error, setError] = useState<string | null>(null);

  // Note: state sync handled by re-mounting dialog content via parent open state.

  const createMutation = useMutation({
    mutationFn: async (payload: Omit<ProductCreateFormState, 'price' | 'stock'> & { price: number; stock: number }) => {
      return axios.post('/api/products/manual', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onOpenChange(false);
      setError(null);
      setForm(initialState);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || err?.message || 'Gagal menambah produk');
    },
  });

  const validate = () => {
    if (!form.storeId) return 'Pilih toko terlebih dahulu.';
    if (!form.name.trim()) return 'Nama produk wajib diisi.';
    if (!form.sku.trim()) return 'SKU wajib diisi.';

    const priceNum = Number(form.price);
    if (!Number.isFinite(priceNum) || priceNum < 0) return 'Harga tidak valid.';

    const stockNum = Number(form.stock);
    if (!Number.isFinite(stockNum) || stockNum < 0) return 'Stok tidak valid.';

    return null;
  };

  const handleSubmit = () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    const priceNum = Number(form.price);
    const stockNum = Number(form.stock);

    createMutation.mutate({
      storeId: form.storeId,
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: priceNum,
      stock: stockNum,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Produk</DialogTitle>
          <DialogDescription>Masukkan data produk untuk ditambahkan ke database.</DialogDescription>
        </DialogHeader>

        {error && (
          <Card className="surface-glass p-4">
            <div className="flex items-center gap-2">
              <Badge className="surface-badge-danger">Error</Badge>
              <p className="text-sm text-system-danger">{error}</p>
            </div>
          </Card>
        )}

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nama Produk</Label>
            <Input
              placeholder="Nama produk"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>SKU</Label>
            <Input
              placeholder="SKU"
              value={form.sku}
              onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Harga</Label>
            <Input
              placeholder="Harga"
              inputMode="decimal"
              value={form.price}
              onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Stok</Label>
            <Input
              placeholder="Stok"
              inputMode="numeric"
              value={form.stock}
              onChange={(e) => setForm((s) => ({ ...s, stock: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Toko</Label>
            <Select
              value={form.storeId}
              onValueChange={(v) => setForm((s) => ({ ...s, storeId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih toko" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createMutation.isPending}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Menyimpan...' : 'Tambah'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

