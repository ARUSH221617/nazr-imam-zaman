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
  const tags = await db.blogTagTranslation.findMany({
    orderBy: [{ language: "asc" }, { name: "asc" }],
    include: {
      tag: {
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
      <h3 className="text-lg font-semibold text-foreground">{t("admin.blog.tags")}</h3>
      <TagForm
        initialTags={tags.map((tag) => ({
          id: tag.tagId,
          tagId: tag.tagId,
          name: tag.name,
          slug: tag.slug,
          language: tag.language,
          postCount: tag.tag._count.posts,
        }))}
      />
    </div>
  );
}
