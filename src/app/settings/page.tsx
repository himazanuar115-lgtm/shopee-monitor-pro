'use client';

import { useSession } from 'next-auth/react';
import { User, ShieldCheck, Info } from 'lucide-react';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-emphasis">Pengaturan</h1>
        <p className="mt-2 text-muted">Kelola profil pengguna dan preferensi aplikasi.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="surface-glass">
          <CardHeader>
            <CardTitle className="text-base">Akun Anda</CardTitle>
            <CardDescription>Informasi profil dan peran</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="surface-icon inline-flex h-12 w-12 items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted">Nama</p>
                  <p className="font-medium text-emphasis">{session?.user?.name || 'Pengguna'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="surface-icon inline-flex h-12 w-12 items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted">Role</p>
                  <p className="font-medium text-emphasis">{(session?.user as any)?.role || 'STAFF'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="surface-icon inline-flex h-12 w-12 items-center justify-center">
                  <Info size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted">Email</p>
                  <p className="font-medium text-emphasis">{session?.user?.email || 'email@example.com'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-glass">
          <CardHeader>
            <CardTitle className="text-base">Mode Tampilan</CardTitle>
            <CardDescription>Gunakan tema gelap untuk tampilan premium.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Tema Aplikasi</p>
                <p className="text-sm text-subtle">Dark mode aktif secara default.</p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="surface-glass">
        <CardHeader>
          <CardTitle className="text-base">Panduan Cepat</CardTitle>
          <CardDescription>Tips untuk memaksimalkan Shopee Monitor Pro.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-muted">
            <li>• Gunakan dashboard untuk memantau omzet dan performa toko tiap hari.</li>
            <li>• Kelola hingga 10 toko Shopee sekaligus dan gunakan filter untuk analisis.</li>
            <li>• Pantau chat, notifikasi, dan produk stok menipis secara realtime.</li>
            <li>• Eksport laporan PDF/Excel untuk presentasi dan pelaporan.</li>
          </ul>
          <div className="mt-6">
            <Button variant="outline">Hubungi Dukungan</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
