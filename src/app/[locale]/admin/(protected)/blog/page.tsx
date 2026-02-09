import { BlogPostStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { PostRowActions } from "@/components/admin/blog/PostRowActions";
import { Link } from "@/i18n/routing";
import { db } from "@/lib/db";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  status: z.nativeEnum(BlogPostStatus).optional(),
  language: z.string().optional(),
  categoryId: z.string().optional(),
  q: z.string().optional(),
});

export default async function AdminBlogPostsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const rawSearchParams = await searchParams;
  const parsedQuery = querySchema.safeParse({
    page: rawSearchParams.page,
    status: rawSearchParams.status,
    language: rawSearchParams.language,
    categoryId: rawSearchParams.categoryId,
    q: rawSearchParams.q,
  });

  const query = parsedQuery.success
    ? parsedQuery.data
    : { page: 1, status: undefined, language: "", categoryId: "", q: "" };
  const pageSize = 12;

  const normalizedSearch = query.q?.trim();
  const categoryTranslationFilter = query.language ? { language: query.language } : {};
  const where = {
    ...(query.language ? { language: query.language } : {}),
    ...(normalizedSearch
      ? {
          OR: [
            {
              title: {
                contains: normalizedSearch,
                mode: "insensitive" as const,
              },
            },
            {
              excerpt: {
                contains: normalizedSearch,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
    ...(query.status || query.categoryId
      ? {
          post: {
            ...(query.status ? { status: query.status } : {}),
            ...(query.categoryId ? { categoryId: query.categoryId } : {}),
          },
        }
      : {}),
  };

  const [categories, totalItems, translations] = await Promise.all([
    db.blogCategoryTranslation.findMany({
      orderBy: [{ language: "asc" }, { name: "asc" }],
      select: {
        categoryId: true,
        name: true,
        language: true,
      },
    }),
    db.blogPostTranslation.count({ where }),
    db.blogPostTranslation.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (query.page - 1) * pageSize,
      take: pageSize,
      include: {
        post: {
          select: {
            id: true,
            status: true,
            category: {
              select: {
                translations: {
                  where: categoryTranslationFilter,
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const createHref = (page: number) => {
    const paramsBuilder = new URLSearchParams();
    paramsBuilder.set("page", String(page));
    if (query.status) {
      paramsBuilder.set("status", query.status);
    }
    if (query.language) {
      paramsBuilder.set("language", query.language);
    }
    if (query.categoryId) {
      paramsBuilder.set("categoryId", query.categoryId);
    }
    if (query.q) {
      paramsBuilder.set("q", query.q);
    }
    return `/admin/blog?${paramsBuilder.toString()}`;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-foreground">{t("admin.blog.posts")}</h3>
        <Link
          href="/admin/blog/new"
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          {t("admin.blog.newPost")}
        </Link>
      </div>

      <form className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-5">
        <input
          type="text"
          name="q"
          defaultValue={query.q ?? ""}
          placeholder={t("admin.blog.searchPlaceholder")}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <select
          name="status"
          defaultValue={query.status ?? ""}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">{t("admin.blog.allStatuses")}</option>
          {Object.values(BlogPostStatus).map((status) => (
            <option key={status} value={status}>
              {t(`admin.blog.status.${status.toLowerCase()}`)}
            </option>
          ))}
        </select>
        <select
          name="language"
          defaultValue={query.language ?? ""}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">{t("admin.blog.allLanguages")}</option>
          <option value="fa">Farsi</option>
          <option value="ar">Arabic</option>
          <option value="en">English</option>
        </select>
        <select
          name="categoryId"
          defaultValue={query.categoryId ?? ""}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">{t("admin.blog.allCategories")}</option>
          {categories.map((category) => (
            <option key={`${category.categoryId}-${category.language}`} value={category.categoryId}>
              {category.name} ({category.language})
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
        >
          {t("admin.blog.filter")}
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_2fr] gap-3 border-b border-border bg-muted/40 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
          <span>{t("admin.blog.columns.title")}</span>
          <span>{t("admin.blog.columns.status")}</span>
          <span>{t("admin.blog.columns.language")}</span>
          <span>{t("admin.blog.columns.category")}</span>
          <span>{t("admin.blog.columns.actions")}</span>
        </div>
        <div className="divide-y divide-border">
          {translations.length ? (
            translations.map((translation) => (
              <div key={`${translation.postId}-${translation.language}`} className="grid gap-2 px-4 py-4 md:grid-cols-[2fr_1fr_1fr_1fr_2fr] md:items-center md:gap-3">
                <div>
                  <p className="font-medium text-foreground">{translation.title}</p>
                  <p className="text-xs text-muted-foreground">{translation.slug}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t(`admin.blog.status.${translation.post.status.toLowerCase()}`)}
                </p>
                <p className="text-sm text-muted-foreground">{translation.language}</p>
                <p className="text-sm text-muted-foreground">
                  {translation.post.category?.translations[0]?.name ?? "-"}
                </p>
                <PostRowActions id={translation.postId} status={translation.post.status} language={translation.language} />
              </div>
            ))
          ) : (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">{t("admin.blog.empty")}</div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Link
          href={createHref(Math.max(1, query.page - 1))}
          className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
        >
          Prev
        </Link>
        <span className="text-sm text-muted-foreground">
          {query.page} / {totalPages}
        </span>
        <Link
          href={createHref(Math.min(totalPages, query.page + 1))}
          className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
        >
          Next
        </Link>
      </div>
    </div>
  );
}
