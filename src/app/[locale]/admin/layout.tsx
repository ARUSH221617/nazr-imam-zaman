import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "fa" | "ar" | "en")) {
    notFound();
  }

  const isRtl = ["fa", "ar"].includes(locale);

  return (
    <section
      className={cn("min-h-screen bg-muted/20")}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {children}
    </section>
  );
}
