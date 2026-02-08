import type { Metadata } from "next";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export const metadata: Metadata = {
  title: "منتظران مهدی | Awaiters of Mahdi",
  description: "A spiritual platform for prayers and devotion to Imam Mahdi (may God hasten his reappearance)",
  keywords: ["منتظران مهدی", "Imam Mahdi", "Salawat", "Dua", "Islamic Prayers", "شیعه", "امام زمان", "دعا", "صلوات"],
  authors: [{ name: "منتظران مهدی" }],
  openGraph: {
    title: "منتظران مهدی | Awaiters of Mahdi",
    description: "A spiritual platform for prayers and devotion to Imam Mahdi",
    type: "website",
  },
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  const isRtl = ['fa', 'ar'].includes(locale);

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
