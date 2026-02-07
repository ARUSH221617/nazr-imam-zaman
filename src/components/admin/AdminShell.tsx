"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  children: ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const t = useTranslations();

  const navLinkClassName = cn(
    "flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/50 hover:bg-primary/5",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  );

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b border-border bg-background">
        <div className="container mx-auto flex flex-col gap-2 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("common.siteName")}</p>
            <h1 className="text-2xl font-semibold text-foreground">
              {t("admin.title")}
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto flex flex-col gap-8 px-4 py-8 lg:flex-row">
        <aside className="w-full lg:w-64">
          <nav className="space-y-3">
            <Link className={navLinkClassName} href="/admin/blog">
              <span>{t("admin.nav.blog")}</span>
              <span className="text-xs text-muted-foreground">/admin/blog</span>
            </Link>
            <Link className={navLinkClassName} href="/admin/gallery">
              <span>{t("admin.nav.gallery")}</span>
              <span className="text-xs text-muted-foreground">/admin/gallery</span>
            </Link>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
