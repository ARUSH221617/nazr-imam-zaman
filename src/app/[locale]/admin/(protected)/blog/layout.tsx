import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import { BlogAdminNav } from "@/components/admin/blog/BlogAdminNav";

export default async function AdminBlogLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground" style={{ fontFamily: "var(--font-vazirmatn)" }}>
          {t("admin.blog.title")}
        </h2>
        <BlogAdminNav locale={locale} />
      </div>
      {children}
    </div>
  );
}

