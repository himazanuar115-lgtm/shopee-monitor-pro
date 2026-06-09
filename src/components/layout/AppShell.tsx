'use client';

import { ReactNode, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Sidebar from './Sidebar';
import Header from './Header';

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

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (
      protectedPaths.some((path) => pathname.startsWith(path)) &&
      status === 'unauthenticated'
    ) {
      router.push('/login');
    }
  }, [pathname, status, router]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {authRoutes.some((path) => pathname.startsWith(path)) ? (
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
    </ThemeProvider>
  );
}
