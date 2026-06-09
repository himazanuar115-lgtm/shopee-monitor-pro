'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SessionProvider, useSession } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

const protectedPaths = [
  '/dashboard',
  '/stores',
  '/orders',
  '/products',
  '/chat',
  '/reports',
  '/settings',
];

const authRoutes = ['/login', '/register'];

function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();
  const router = useRouter();
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    if (
      protectedPaths.some((path) => pathname.startsWith(path)) &&
      status === 'unauthenticated'
    ) {
      router.push('/login');
    }
  }, [pathname, status, router]);

  const isAuthRoute = authRoutes.some((path) => pathname.startsWith(path));

  return (
    <QueryClientProvider client={queryClient}>
      {isAuthRoute ? (
        <div className="app-canvas">{children}</div>
      ) : (
        <div className="app-canvas">
          <Sidebar />
          <div className="flex flex-col min-h-screen lg:ml-64">
            <Header />
            <main className="flex-1 overflow-auto">
              <div className="p-4 sm:p-6 lg:p-8">{children}</div>
            </main>
          </div>
        </div>
      )}
    </QueryClientProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AuthGuard>{children}</AuthGuard>
      </ThemeProvider>
    </SessionProvider>
  );
}
