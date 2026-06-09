'use client';

import { useSession } from 'next-auth/react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import NotificationBell from '@/components/notifications/NotificationBell';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="px-6 py-4 flex items-center justify-between gap-4 lg:ml-64">
      <div className="surface-glass flex w-full items-center justify-between gap-4 px-6 py-4">
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
            <Input
              placeholder="Cari pesanan, produk..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <ThemeToggle />
          <NotificationBell />
          <div className="flex items-center gap-3 border-l surface-divider pl-4">
            <div className="surface-avatar flex h-10 w-10 items-center justify-center font-bold">
              {session?.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-emphasis">{session?.user?.name}</p>
              <p className="text-xs text-muted">{session?.user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
