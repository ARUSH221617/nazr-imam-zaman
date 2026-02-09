import { BlogPostStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminCookies } from "@/lib/auth/admin";
import {
  blogPostInputSchema,
  blogPostPatchSchema,
} from "@/lib/blog/schemas";
import { db } from "@/lib/db";
import { ensureUniqueSlug, slugify } from "@/lib/blog/slug";
import { resolveStatusDates } from "@/lib/blog/status";

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

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdminCookies();
  if (authError) {
    return authError;
  }

  const { id } = await params;
  const post = await db.blogPost.findUnique({
    where: {
      id,
    },
    include: {
      translations: true,
      category: true,
      author: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    item: {
      ...post,
      translations: post.translations,
      tagIds: post.tags.map((postTag) => postTag.tagId),
    },
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdminCookies();
  if (authError) {
    return authError;
  }

  const { id } = await params;

  try {
    const payload = blogPostInputSchema.parse(await request.json());
    const existingPost = await db.blogPost.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        status: true,
        publishedAt: true,
      },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const uniqueTagIds = Array.from(new Set(payload.tagIds));
    const relationError = await validateRelations({
      categoryId: payload.categoryId,
      authorId: payload.authorId,
      tagIds: uniqueTagIds,
    });
    if (relationError) {
      return NextResponse.json({ error: relationError }, { status: 400 });
    }

    const baseSlug = payload.slug || slugify(payload.title) || `post-${Date.now()}`;
    const uniqueSlug = await ensureUniqueSlug(baseSlug, async (candidateSlug) => {
      const postWithSlug = await db.blogPostTranslation.findFirst({
        where: {
          slug: candidateSlug,
          language: payload.language,
          postId: {
            not: id,
          },
        },
        select: {
          id: true,
        },
      });

      return Boolean(postWithSlug);
    });

    const { publishAt, publishedAt } = resolveStatusDates({
      status: payload.status,
      publishAt: payload.publishAt,
      existingPublishedAt:
        payload.status === BlogPostStatus.PUBLISHED ? existingPost.publishedAt : null,
    });

    const updated = await db.blogPost.update({
      where: {
        id,
      },
      data: {
        status: payload.status,
        publishAt,
        publishedAt,
        categoryId: payload.categoryId,
        authorId: payload.authorId,
        tags: {
          deleteMany: {},
          ...(uniqueTagIds.length
            ? {
                create: uniqueTagIds.map((tagId) => ({
                  tagId,
                })),
              }
            : {}),
        },
        translations: {
          upsert: {
            where: {
              postId_language: {
                postId: id,
                language: payload.language,
              },
            },
            create: {
              title: payload.title,
              slug: uniqueSlug,
              excerpt: payload.excerpt,
              content: payload.content,
              coverImage: payload.coverImage,
              language: payload.language,
            },
            update: {
              title: payload.title,
              slug: uniqueSlug,
              excerpt: payload.excerpt,
              content: payload.content,
              coverImage: payload.coverImage,
            },
          },
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        translations: true,
      },
    });

    return NextResponse.json({ item: updated });
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdminCookies();
  if (authError) {
    return authError;
  }

  const { id } = await params;
  try {
    const payload = blogPostPatchSchema.parse(await request.json());
    const existingPost = await db.blogPost.findUnique({
      where: { id },
      select: { id: true, publishedAt: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    if (payload.action === "publish") {
      const updated = await db.blogPost.update({
        where: { id },
        data: {
          status: BlogPostStatus.PUBLISHED,
          publishedAt: existingPost.publishedAt ?? new Date(),
        },
      });
      return NextResponse.json({ item: updated });
    }

    if (payload.action === "unpublish") {
      const updated = await db.blogPost.update({
        where: { id },
        data: {
          status: BlogPostStatus.DRAFT,
          publishAt: null,
          publishedAt: null,
        },
      });
      return NextResponse.json({ item: updated });
    }

    const updated = await db.blogPost.update({
      where: { id },
      data: {
        status: BlogPostStatus.ARCHIVED,
        publishAt: null,
        publishedAt: null,
      },
    });
    return NextResponse.json({ item: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdminCookies();
  if (authError) {
    return authError;
  }

  const { id } = await params;

  try {
    await db.blogPost.delete({
      where: {
        id,
      },
    });
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
