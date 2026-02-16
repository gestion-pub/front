import * as React from 'react';
import type { Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';

import '@/styles/global.css';
import '@/styles/design-tokens.css';

import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';
import { UserProvider } from '@/contexts/user-context';

export const viewport = { width: 'device-width', initialScale: 1 } satisfies Viewport;

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function Layout({ children, params }: LayoutProps): Promise<React.JSX.Element> {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="class" />
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <UserProvider>
              {children}
            </UserProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
