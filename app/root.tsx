import { Outlet, isRouteErrorResponse, Links, Scripts, ScrollRestoration } from 'react-router';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import React, { lazy, Suspense } from 'react';
import { cn } from './lib/utils';

import './app.css';

// Define default font
const fontSans = {
  variable: 'font-sans',
};

// Lazy load components for better performance
const Header = lazy(() => import('./components/Header'));
const Footer = lazy(() => import('./components/Footer'));

export const links = () => [
  {
    rel: 'apple-touch-icon',
    sizes: '180x180',
    href: '/apple-touch-icon.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '32x32',
    href: '/favicon-32x32.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '16x16',
    href: '/favicon-16x16.png',
  },
  {
    rel: 'manifest',
    href: '/site.webmanifest',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1"
        />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-title" content="Insbuy" />
        <meta name="description" content="Discover and shop products you'll love" />
        <Links />
      </head>
      <body className={cn('min-h-screen bg-background antialiased', fontSans.variable)}>
        <ThemeProvider>
          <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
              <Suspense fallback={<div className="h-14 sm:h-16 border-b"></div>}>
                <Header />
              </Suspense>
              <div className="flex-1">
                <AnalyticsProvider>{children}</AnalyticsProvider>
              </div>
              <Suspense fallback={null}>
                <Footer />
              </Suspense>
            </div>
          </AuthProvider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404 ? 'The requested page could not be found.' : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
