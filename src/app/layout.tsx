import type { Metadata } from "next";
import { Inter, Vazirmatn } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import { Toaster } from "@/components/ui/toaster";
import { isRTL, type Language } from "@/lib/translations";

import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// Kitab font for Arabic text - using Google Fonts via CSS link
const kitab = {
  variable: "--font-kitab",
};

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = isRTL(locale as Language) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --font-kitab: 'Amiri', serif;
            }
          `
        }} />
      </head>
      <body
        className={`${vazirmatn.variable} ${inter.variable} antialiased bg-background text-foreground`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
