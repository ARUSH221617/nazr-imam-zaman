import { getTranslations } from "next-intl/server";

import { CategoryForm } from "@/components/admin/blog/CategoryForm";
import { db } from "@/lib/db";

export default async function AdminBlogCategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const categories = await db.blogCategory.findMany({
    orderBy: [{ language: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{t("admin.blog.categories")}</h3>
      <CategoryForm
        initialCategories={categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          language: category.language,
          postCount: category._count.posts,
        }))}
      />
    </div>
  );
}

