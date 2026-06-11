import './globals.css';
import { ReactNode } from 'react';
import { Providers } from './providers';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (
                    theme === 'dark' ||
                    (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)
                  ) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>

      <body
        className={`
          ${inter.className}
          min-h-screen
          bg-gray-50 dark:bg-[#0b0f19]
          text-gray-900 dark:text-gray-100
          antialiased
        `}
      >
        <div className="min-h-screen flex flex-col">
          <Providers>
            <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl mx-auto w-full">
              {children}
            </main>
          </Providers>
        </div>
      </body>
    </html>
  );
}