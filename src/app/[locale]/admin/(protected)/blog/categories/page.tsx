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
  const categories = await db.blogCategoryTranslation.findMany({
    orderBy: [{ language: "asc" }, { name: "asc" }],
    include: {
      category: {
        select: {
          id: true,
          _count: {
            select: {
              posts: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{t("admin.blog.categories")}</h3>
      <CategoryForm
        initialCategories={categories.map((category) => ({
          id: category.categoryId,
          categoryId: category.categoryId,
          name: category.name,
          slug: category.slug,
          description: category.description,
          language: category.language,
          postCount: category.category._count.posts,
        }))}
      />
    </div>
  );
}
