import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { z } from "zod";

import { db } from "@/lib/db";
import { buildVisiblePostsWhere } from "@/lib/blog/visibility";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BlogPagination } from "@/components/blog/BlogPagination";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  q: z.string().optional(),
});

export default async function BlogTagPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale });
  const rawSearchParams = await searchParams;
  const query = querySchema.safeParse({
    page: rawSearchParams.page,
    q: rawSearchParams.q,
  });
  const currentQuery = query.success ? query.data : { page: 1, q: "" };

  const tag = await db.blogTag.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!tag) {
    notFound();
  }

  const pageSize = 10;
  const where = buildVisiblePostsWhere({
    language: locale,
    tagId: tag.id,
    search: currentQuery.q,
  });

  const [totalItems, posts] = await Promise.all([
    db.blogPost.count({ where }),
    db.blogPost.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { publishAt: "desc" }, { createdAt: "desc" }],
      skip: (currentQuery.page - 1) * pageSize,
      take: pageSize,
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const createHref = (page: number) => {
    const paramsBuilder = new URLSearchParams();
    paramsBuilder.set("page", String(page));
    if (currentQuery.q) {
      paramsBuilder.set("q", currentQuery.q);
    }
    return `/blog/tag/${slug}?${paramsBuilder.toString()}`;
  };

  return (
    <main className="container mx-auto min-h-screen space-y-8 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground" style={{ fontFamily: "var(--font-vazirmatn)" }}>
          {t("blog.tagTitle", { name: tag.name })}
        </h1>
      </div>
      <form className="flex gap-3 rounded-xl border border-border bg-card p-4">
        <input
          type="text"
          name="q"
          defaultValue={currentQuery.q ?? ""}
          placeholder={t("blog.searchPlaceholder")}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          {t("blog.filter")}
        </button>
      </form>

      {posts.length ? (
        <section className="grid gap-6">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} locale={locale} />
          ))}
          <BlogPagination page={currentQuery.page} totalPages={totalPages} buildHref={createHref} />
        </section>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          {t("blog.empty")}
        </div>
      )}
    </main>
  );
}

