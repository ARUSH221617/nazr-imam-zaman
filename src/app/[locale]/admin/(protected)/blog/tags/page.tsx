import { getTranslations } from "next-intl/server";

import { TagForm } from "@/components/admin/blog/TagForm";
import { db } from "@/lib/db";

export default async function AdminBlogTagsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const tags = await db.blogTag.findMany({
    orderBy: {
      name: "asc",
    },
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
      <h3 className="text-lg font-semibold text-foreground">{t("admin.blog.tags")}</h3>
      <TagForm
        initialTags={tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          postCount: tag._count.posts,
        }))}
      />
    </div>
  );
}

