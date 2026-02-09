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
  const categories = await db.blogCategoryTranslation.findMany({
    where: language
      ? {
          language,
        }
      : undefined,
    orderBy: [{ language: "asc" }, { name: "asc" }],
    include: {
      category: {
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
    items: categories.map((category) => ({
      id: category.categoryId,
      categoryId: category.categoryId,
      name: category.name,
      slug: category.slug,
      description: category.description,
      language: category.language,
      postCount: category.category._count.posts,
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
        await db.blogCategoryTranslation.findUnique({
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

    const created = await db.blogCategoryTranslation.create({
      data: {
        category:
          payload.categoryId === null
            ? {
                create: {},
              }
            : {
                connect: {
                  id: payload.categoryId,
                },
              },
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
