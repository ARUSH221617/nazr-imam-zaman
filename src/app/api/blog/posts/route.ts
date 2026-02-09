import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { publicPostsQuerySchema } from "@/lib/blog/schemas";
import { buildVisiblePostsWhere } from "@/lib/blog/visibility";
import { getVisibleAt } from "@/lib/blog/dates";
import { calcReadingTime } from "@/lib/blog/reading-time";

export async function GET(request: Request) {
  const query = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsedQuery = publicPostsQuerySchema.safeParse(query);

  if (!parsedQuery.success) {
    return NextResponse.json({ error: "invalid_query" }, { status: 400 });
  }

  const { page, pageSize, q, category, tag, language } = parsedQuery.data;
  const now = new Date();
  const normalizedLanguage = language?.trim() || "fa";

  const [categoryRecord, tagRecord] = await Promise.all([
    category
      ? db.blogCategoryTranslation.findUnique({
          where: {
            slug_language: {
              slug: category,
              language: normalizedLanguage,
            },
          },
          select: {
            categoryId: true,
            name: true,
            slug: true,
            language: true,
          },
        })
      : null,
    tag
      ? db.blogTagTranslation.findUnique({
          where: {
            slug_language: {
              slug: tag,
              language: normalizedLanguage,
            },
          },
          select: {
            tagId: true,
            name: true,
            slug: true,
            language: true,
          },
        })
      : null,
  ]);

  if ((category && !categoryRecord) || (tag && !tagRecord)) {
    return NextResponse.json({
      items: [],
      pagination: {
        page,
        pageSize,
        totalItems: 0,
        totalPages: 0,
      },
    });
  }

  const where = buildVisiblePostsWhere({
    now,
    language: normalizedLanguage,
    categoryId: categoryRecord?.categoryId,
    tagId: tagRecord?.tagId,
    search: q,
  });

  const [totalItems, posts] = await Promise.all([
    db.blogPost.count({ where }),
    db.blogPost.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { publishAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        translations: {
          where: {
            language: normalizedLanguage,
          },
          select: {
            title: true,
            slug: true,
            excerpt: true,
            content: true,
            coverImage: true,
            language: true,
          },
        },
        category: {
          select: {
            id: true,
            translations: {
              where: {
                language: normalizedLanguage,
              },
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                translations: {
                  where: {
                    language: normalizedLanguage,
                  },
                  select: {
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    items: posts.map((post) => {
      const translation = post.translations[0];
      return {
        id: post.id,
        title: translation?.title ?? "",
        slug: translation?.slug ?? "",
        excerpt: translation?.excerpt ?? null,
        coverImage: translation?.coverImage ?? null,
        language: translation?.language ?? normalizedLanguage,
        visibleAt: getVisibleAt(post).toISOString(),
        readingTime: calcReadingTime(translation?.content ?? ""),
        category: post.category
          ? {
              id: post.category.id,
              name: post.category.translations[0]?.name ?? "",
              slug: post.category.translations[0]?.slug ?? "",
            }
          : null,
        tags: post.tags.map((postTag) => ({
          id: postTag.tag.id,
          name: postTag.tag.translations[0]?.name ?? "",
          slug: postTag.tag.translations[0]?.slug ?? "",
        })),
        author: post.author,
      };
    }),
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    },
    filters: {
      q: q ?? "",
      category: categoryRecord,
      tag: tagRecord,
      language: normalizedLanguage,
    },
  });
}
