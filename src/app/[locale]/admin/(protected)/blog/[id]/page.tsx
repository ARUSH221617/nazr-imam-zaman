import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { PostForm } from "@/components/admin/blog/PostForm";
import { db } from "@/lib/db";

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale });

  const [post, categories, tags, authors] = await Promise.all([
    db.blogPost.findUnique({
      where: {
        id,
      },
      include: {
        tags: {
          select: {
            tagId: true,
          },
        },
      },
    }),
    db.blogCategory.findMany({
      orderBy: [{ language: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        language: true,
      },
    }),
    db.blogTag.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
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
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            coverImage: post.coverImage,
            status: post.status,
            language: post.language,
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

