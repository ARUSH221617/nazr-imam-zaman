import { BlogPostStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminCookies } from "@/lib/auth/admin";
import {
  adminPostsQuerySchema,
  blogPostDuplicateSchema,
  blogPostInputSchema,
} from "@/lib/blog/schemas";
import { db } from "@/lib/db";
import { ensureUniqueSlug, slugify } from "@/lib/blog/slug";
import { resolveStatusDates } from "@/lib/blog/status";

const getExistingPostSlug = async (slug: string, language: string) => {
  return db.blogPost.findUnique({
    where: {
      slug_language: {
        slug,
        language,
      },
    },
    select: {
      id: true,
    },
  });
};

const validateRelations = async ({
  categoryId,
  authorId,
  tagIds,
}: {
  categoryId: string | null;
  authorId: string | null;
  tagIds: string[];
}) => {
  const [category, author, tagsCount] = await Promise.all([
    categoryId
      ? db.blogCategory.findUnique({
          where: {
            id: categoryId,
          },
          select: {
            id: true,
          },
        })
      : null,
    authorId
      ? db.user.findUnique({
          where: {
            id: authorId,
          },
          select: {
            id: true,
          },
        })
      : null,
    tagIds.length
      ? db.blogTag.count({
          where: {
            id: {
              in: tagIds,
            },
          },
        })
      : 0,
  ]);

  if (categoryId && !category) {
    return "invalid_category";
  }

  if (authorId && !author) {
    return "invalid_author";
  }

  if (tagIds.length && tagsCount !== tagIds.length) {
    return "invalid_tags";
  }

  return null;
};

export async function GET(request: Request) {
  const authError = await requireAdminCookies();
  if (authError) {
    return authError;
  }

  const query = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsedQuery = adminPostsQuerySchema.safeParse(query);

  if (!parsedQuery.success) {
    return NextResponse.json({ error: "invalid_query" }, { status: 400 });
  }

  const { page, pageSize, q, status, language, categoryId } = parsedQuery.data;
  const normalizedSearch = q?.trim();
  const where = {
    ...(status ? { status } : {}),
    ...(language ? { language } : {}),
    ...(categoryId ? { categoryId } : {}),
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
            {
              content: {
                contains: normalizedSearch,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [totalItems, posts] = await Promise.all([
    db.blogPost.count({ where }),
    db.blogPost.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            language: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            tags: true,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    items: posts,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    },
  });
}

export async function POST(request: Request) {
  const authError = await requireAdminCookies();
  if (authError) {
    return authError;
  }

  try {
    const payload = await request.json();

    const duplicatePayload = blogPostDuplicateSchema.safeParse(payload);
    if (duplicatePayload.success) {
      const source = await db.blogPost.findUnique({
        where: {
          id: duplicatePayload.data.sourceId,
        },
        include: {
          tags: {
            select: {
              tagId: true,
            },
          },
        },
      });

      if (!source) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }

      const duplicatedSlug = await ensureUniqueSlug(
        slugify(`${source.slug}-copy`) || `post-${Date.now()}`,
        async (candidateSlug) =>
          Boolean(await getExistingPostSlug(candidateSlug, source.language)),
      );

      const duplicatedPost = await db.blogPost.create({
        data: {
          title: `${source.title} (Copy)`,
          slug: duplicatedSlug,
          excerpt: source.excerpt,
          content: source.content,
          coverImage: source.coverImage,
          status: BlogPostStatus.DRAFT,
          language: source.language,
          publishAt: null,
          publishedAt: null,
          categoryId: source.categoryId,
          authorId: source.authorId,
          tags: source.tags.length
            ? {
                create: source.tags.map((tag) => ({
                  tagId: tag.tagId,
                })),
              }
            : undefined,
        },
      });

      return NextResponse.json({ item: duplicatedPost }, { status: 201 });
    }

    const data = blogPostInputSchema.parse(payload);
    const uniqueTagIds = Array.from(new Set(data.tagIds));

    const relationError = await validateRelations({
      categoryId: data.categoryId,
      authorId: data.authorId,
      tagIds: uniqueTagIds,
    });
    if (relationError) {
      return NextResponse.json({ error: relationError }, { status: 400 });
    }

    const baseSlug = data.slug || slugify(data.title) || `post-${Date.now()}`;
    const uniqueSlug = await ensureUniqueSlug(baseSlug, async (candidateSlug) =>
      Boolean(await getExistingPostSlug(candidateSlug, data.language)),
    );

    const { publishAt, publishedAt } = resolveStatusDates({
      status: data.status,
      publishAt: data.publishAt,
      existingPublishedAt: null,
    });

    const createdPost = await db.blogPost.create({
      data: {
        title: data.title,
        slug: uniqueSlug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        status: data.status,
        language: data.language,
        publishAt,
        publishedAt,
        categoryId: data.categoryId,
        authorId: data.authorId,
        tags: uniqueTagIds.length
          ? {
              create: uniqueTagIds.map((tagId) => ({
                tagId,
              })),
            }
          : undefined,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json({ item: createdPost }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    if (
      error instanceof Error &&
      error.message === "publishAt_required_for_scheduled"
    ) {
      return NextResponse.json(
        { error: "publishAt_required_for_scheduled" },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

