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

  const tags = await db.blogTag.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  return NextResponse.json({
    items: tags.map((tag) => ({
      ...tag,
      postCount: tag._count.posts,
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
    const uniqueSlug = await ensureUniqueSlug(baseSlug, async (candidateSlug) =>
      Boolean(
        await db.blogTag.findUnique({
          where: {
            slug: candidateSlug,
          },
          select: {
            id: true,
          },
        }),
      ),
    );

    const created = await db.blogTag.create({
      data: {
        name: payload.name,
        slug: uniqueSlug,
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

