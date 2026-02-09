import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { buildVisiblePostsWhere } from "@/lib/blog/visibility";
import { publicPostsQuerySchema } from "@/lib/blog/schemas";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BlogPagination } from "@/components/blog/BlogPagination";

const listQuerySchema = publicPostsQuerySchema.extend({
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export default async function BlogIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const rawSearchParams = await searchParams;
  const parsed = listQuerySchema.safeParse({
    page: rawSearchParams.page,
    pageSize: rawSearchParams.pageSize,
    q: rawSearchParams.q,
    category: rawSearchParams.category,
    tag: rawSearchParams.tag,
    language: locale,
  });

  const query = parsed.success
    ? parsed.data
    : {
        page: 1,
        pageSize: 10,
        q: "",
        category: undefined,
        tag: undefined,
        language: locale,
      };

  const [categories, tags, selectedCategory, selectedTag] = await Promise.all([
    db.blogCategoryTranslation.findMany({
      where: {
        language: locale,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        categoryId: true,
        name: true,
        slug: true,
      },
    }),
    db.blogTagTranslation.findMany({
      where: {
        language: locale,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        tagId: true,
        name: true,
        slug: true,
      },
    }),
    query.category
      ? db.blogCategoryTranslation.findUnique({
          where: {
            slug_language: {
              slug: query.category,
              language: locale,
            },
          },
          select: {
            categoryId: true,
            name: true,
            slug: true,
          },
        })
      : null,
    query.tag
      ? db.blogTagTranslation.findUnique({
          where: {
            slug_language: {
              slug: query.tag,
              language: locale,
            },
          },
          select: {
            tagId: true,
            name: true,
            slug: true,
          },
        })
      : null,
  ]);

  const noFilterMatch =
    (query.category && !selectedCategory) || (query.tag && !selectedTag);

  const where = noFilterMatch
    ? { id: { equals: "__no_match__" } }
    : buildVisiblePostsWhere({
        language: locale,
        categoryId: selectedCategory?.categoryId,
        tagId: selectedTag?.tagId,
        search: query.q,
      });

  const [totalItems, posts] = await Promise.all([
    db.blogPost.count({ where }),
    db.blogPost.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { publishAt: "desc" }, { createdAt: "desc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: {
        translations: {
          where: {
            language: locale,
          },
          select: {
            title: true,
            slug: true,
            excerpt: true,
            content: true,
            coverImage: true,
          },
        },
        category: {
          select: {
            translations: {
              where: {
                language: locale,
              },
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / query.pageSize));
  const createHref = (page: number) => {
    const paramsBuilder = new URLSearchParams();
    paramsBuilder.set("page", String(page));
    if (query.q) {
      paramsBuilder.set("q", query.q);
    }
    if (query.category) {
      paramsBuilder.set("category", query.category);
    }
    if (query.tag) {
      paramsBuilder.set("tag", query.tag);
    }
    return `/blog?${paramsBuilder.toString()}`;
  };

  return (
    <main className="container mx-auto min-h-screen space-y-8 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground" style={{ fontFamily: "var(--font-vazirmatn)" }}>
          {t("blog.title")}
        </h1>
        <p className="text-muted-foreground">{t("blog.subtitle")}</p>
      </div>

      <form className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-4">
        <input
          type="text"
          name="q"
          defaultValue={query.q ?? ""}
          placeholder={t("blog.searchPlaceholder")}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <select
          name="category"
          defaultValue={query.category ?? ""}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">{t("blog.allCategories")}</option>
          {categories.map((category) => (
            <option key={category.categoryId} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          name="tag"
          defaultValue={query.tag ?? ""}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">{t("blog.allTags")}</option>
          {tags.map((tag) => (
            <option key={tag.tagId} value={tag.slug}>
              {tag.name}
            </option>
          ))}
        </select>
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
            <BlogPostCard
              key={post.id}
              post={{
                title: post.translations[0]?.title ?? "",
                slug: post.translations[0]?.slug ?? "",
                excerpt: post.translations[0]?.excerpt ?? null,
                content: post.translations[0]?.content ?? "",
                coverImage: post.translations[0]?.coverImage ?? null,
                publishedAt: post.publishedAt,
                publishAt: post.publishAt,
                createdAt: post.createdAt,
                category: post.category?.translations[0]
                  ? {
                      name: post.category.translations[0].name,
                      slug: post.category.translations[0].slug,
                    }
                  : null,
              }}
              locale={locale}
            />
          ))}
          <BlogPagination page={query.page} totalPages={totalPages} buildHref={createHref} />
        </section>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          {t("blog.empty")}
        </div>
      )}
    </main>
  );
}
