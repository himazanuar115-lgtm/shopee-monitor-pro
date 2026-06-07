'use client';

import { useSession } from 'next-auth/react';
import { Bell, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import NotificationBell from '@/components/notifications/NotificationBell';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between gap-4 lg:ml-64">
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <Input
            placeholder="Cari pesanan, produk..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <NotificationBell />
        <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            {session?.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">{session?.user?.name}</p>
            <p className="text-xs text-slate-400">{session?.user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
