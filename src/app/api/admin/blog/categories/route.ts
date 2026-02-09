import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminCookies } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { blogCategoryInputSchema } from "@/lib/blog/schemas";
import { ensureUniqueSlug, slugify } from "@/lib/blog/slug";

export async function GET(request: Request) {
  const authError = await requireAdminCookies();
  if (authError) {
    return authError;
  }

  const language = new URL(request.url).searchParams.get("language")?.trim();
  const categories = await db.blogCategory.findMany({
    where: language
      ? {
          language,
        }
      : undefined,
    orderBy: [{ language: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  return NextResponse.json({
    items: categories.map((category) => ({
      ...category,
      postCount: category._count.posts,
    })),
  });
}

export async function POST(request: Request) {
  const authError = await requireAdminCookies();
  if (authError) {
    return authError;
  }

  try {
    const payload = blogCategoryInputSchema.parse(await request.json());
    const baseSlug =
      payload.slug || slugify(payload.name) || `category-${Date.now()}`;
    const uniqueSlug = await ensureUniqueSlug(baseSlug, async (candidateSlug) =>
      Boolean(
        await db.blogCategory.findUnique({
          where: {
            slug_language: {
              slug: candidateSlug,
              language: payload.language,
            },
          },
          select: {
            id: true,
          },
        }),
      ),
    );

    const created = await db.blogCategory.create({
      data: {
        name: payload.name,
        slug: uniqueSlug,
        description: payload.description,
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

