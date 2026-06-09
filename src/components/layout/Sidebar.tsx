'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Store,
  ShoppingCart,
  Package,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/stores', label: 'Toko', icon: Store },
  { href: '/orders', label: 'Pesanan', icon: ShoppingCart },
  { href: '/products', label: 'Produk', icon: Package },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/reports', label: 'Laporan', icon: FileText },
  { href: '/settings', label: 'Pengaturan', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 lg:hidden surface-glass p-2 text-emphasis"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 flex flex-col z-30 transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'surface-glass rounded-none border-r surface-divider'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b surface-divider">
          <div className="flex items-center gap-3">
            <div className="surface-icon flex h-10 w-10 items-center justify-center">
              <Store size={24} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-emphasis">Shopee Monitor</h1>
              <p className="text-xs text-muted">Pro Dashboard</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'surface-row surface-row-active'
                    : 'surface-row border-transparent bg-transparent text-muted'
                )}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        {session?.user && (
          <div className="space-y-3 border-t surface-divider p-4">
            <div className="flex items-center gap-3 px-2">
              <div className="surface-avatar flex h-8 w-8 items-center justify-center text-xs font-bold">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-emphasis">{session.user.name}</p>
                <p className="truncate text-xs text-muted">{session.user.email}</p>
              </div>
            </div>
            <Button
              onClick={() => signOut({ callbackUrl: '/login' })}
              variant="ghost"
              className="w-full justify-start text-[hsl(var(--destructive))] hover:bg-[hsla(var(--destructive),0.12)]"
            >
              <LogOut size={20} />
              Logout
            </Button>
          </div>
        )}
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
