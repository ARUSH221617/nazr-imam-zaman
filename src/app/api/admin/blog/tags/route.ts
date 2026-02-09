import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminCookies } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { blogTagInputSchema } from "@/lib/blog/schemas";
import { ensureUniqueSlug, slugify } from "@/lib/blog/slug";

export async function GET() {
  const authError = await requireAdminCookies();
  if (authError) {
    return authError;
  }

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

  return NextResponse.json({
    items: tags.map((tag) => ({
      id: tag.tagId,
      tagId: tag.tagId,
      name: tag.name,
      slug: tag.slug,
      language: tag.language,
      postCount: tag.tag._count.posts,
    })),
  });
}

export async function POST(request: Request) {
  const authError = await requireAdminCookies();
  if (authError) {
    return authError;
  }

  try {
    const payload = blogTagInputSchema.parse(await request.json());
    const baseSlug = payload.slug || slugify(payload.name) || `tag-${Date.now()}`;
    const uniqueSlug = await ensureUniqueSlug(baseSlug, async (candidateSlug) => {
      const existing = await db.blogTagTranslation.findUnique({
        where: {
          slug_language: {
            slug: candidateSlug,
            language: payload.language,
          },
        },
        select: {
          id: true,
        },
      });

      return Boolean(existing);
    });

    const created = await db.blogTagTranslation.create({
      data: {
        tag:
          payload.tagId === null
            ? {
                create: {},
              }
            : {
                connect: {
                  id: payload.tagId,
                },
              },
        name: payload.name,
        slug: uniqueSlug,
        language: payload.language,
      },
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
