"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { prayerTextClassName, prayerTextStyle } from "@/lib/typography";

export default function AdminPage() {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2
          className={cn(prayerTextClassName, "text-foreground")}
          style={prayerTextStyle}
        >
          {t("admin.title")}
        </h2>
        <p
          className="text-sm text-muted-foreground"
          style={{ fontFamily: "var(--font-vazirmatn)" }}
        >
          {t("admin.nav.blog")} · {t("admin.nav.gallery")}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-dashed border-border bg-background p-6">
          <h3
            className="text-lg font-semibold text-foreground"
            style={{ fontFamily: "var(--font-vazirmatn)" }}
          >
            {t("admin.nav.blog")}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            /admin/blog
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-background p-6">
          <h3
            className="text-lg font-semibold text-foreground"
            style={{ fontFamily: "var(--font-vazirmatn)" }}
          >
            {t("admin.nav.gallery")}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            /admin/gallery
          </p>
        </div>
      </div>
    </div>
  );
}
