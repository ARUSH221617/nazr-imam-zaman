import { getTranslations } from "next-intl/server";

import { PostForm } from "@/components/admin/blog/PostForm";
import { db } from "@/lib/db";

export default async function AdminBlogNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const [categories, tags, authors] = await Promise.all([
    db.blogCategoryTranslation.findMany({
      orderBy: [{ language: "asc" }, { name: "asc" }],
      select: {
        categoryId: true,
        name: true,
        language: true,
      },
    }),
    db.blogTagTranslation.findMany({
      orderBy: [{ language: "asc" }, { name: "asc" }],
      select: {
        tagId: true,
        name: true,
        language: true,
      },
    }),
    db.user.findMany({
      orderBy: {
        email: "asc",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),
  ]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{t("admin.blog.newPost")}</h3>
      <div className="rounded-xl border border-border bg-card p-5">
        <PostForm
          locale={locale}
          mode="create"
          categories={categories}
          tags={tags}
          authors={authors}
        />
      </div>
    </div>
  );
}
