import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LanguageWrapper } from "@/components/LanguageWrapper";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
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
        <LanguageProvider>
          <LanguageWrapper>
            {children}
          </LanguageWrapper>
        </LanguageProvider>
        <Toaster />
      </body>
    </html>
  );
}
