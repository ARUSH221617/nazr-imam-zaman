import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { PostForm } from "@/components/admin/blog/PostForm";
import { db } from "@/lib/db";

export default async function AdminBlogEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale });
  const rawSearchParams = await searchParams;
  const selectedLanguage = typeof rawSearchParams.language === "string" ? rawSearchParams.language : locale;

  const [post, categories, tags, authors] = await Promise.all([
    db.blogPost.findUnique({
      where: {
        id,
      },
      include: {
        translations: true,
        tags: {
          select: {
            tagId: true,
          },
        },
      },
    }),
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

  if (!post) {
    notFound();
  }

  const translation =
    post.translations.find((item) => item.language === selectedLanguage) ??
    post.translations.find((item) => item.language === locale) ??
    post.translations[0] ??
    null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{t("admin.blog.editPost")}</h3>
      <div className="rounded-xl border border-border bg-card p-5">
        <PostForm
          locale={locale}
          mode="edit"
          postId={id}
          categories={categories}
          tags={tags}
          authors={authors}
          initialValues={{
            title: translation?.title ?? "",
            slug: translation?.slug ?? "",
            excerpt: translation?.excerpt ?? null,
            content: translation?.content ?? "",
            coverImage: translation?.coverImage ?? null,
            status: post.status,
            language: translation?.language ?? selectedLanguage,
            publishAt: post.publishAt,
            categoryId: post.categoryId,
            authorId: post.authorId,
            tagIds: post.tags.map((tag) => tag.tagId),
          }}
        />
      </div>
    </div>
  );
}
