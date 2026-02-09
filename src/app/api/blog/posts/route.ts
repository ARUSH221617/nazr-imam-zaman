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
      ? db.blogCategory.findUnique({
          where: {
            slug_language: {
              slug: category,
              language: normalizedLanguage,
            },
          },
          select: {
            id: true,
            name: true,
            slug: true,
          },
        })
      : null,
    tag
      ? db.blogTag.findUnique({
          where: {
            slug: tag,
          },
          select: {
            id: true,
            name: true,
            slug: true,
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
    categoryId: categoryRecord?.id,
    tagId: tagRecord?.id,
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
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
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
    items: posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      language: post.language,
      visibleAt: getVisibleAt(post).toISOString(),
      readingTime: calcReadingTime(post.content),
      category: post.category,
      tags: post.tags.map((postTag) => postTag.tag),
      author: post.author,
    })),
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

