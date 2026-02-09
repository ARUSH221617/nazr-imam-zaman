import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminCookies } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { blogCategoryInputSchema } from "@/lib/blog/schemas";
import { ensureUniqueSlug, slugify } from "@/lib/blog/slug";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdminCookies();
  if (authError) {
    return authError;
  }

  const { id } = await params;
  const language = new URL(request.url).searchParams.get("language")?.trim();
  const category = language
    ? await db.blogCategoryTranslation.findUnique({
        where: {
          categoryId_language: {
            categoryId: id,
            language,
          },
        },
      })
    : await db.blogCategoryTranslation.findFirst({
        where: {
          categoryId: id,
        },
        orderBy: {
          language: "asc",
        },
      });

  if (!category) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ item: category });
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
    const payload = blogCategoryInputSchema.parse(await request.json());
    const baseSlug =
      payload.slug || slugify(payload.name) || `category-${Date.now()}`;
    const uniqueSlug = await ensureUniqueSlug(baseSlug, async (candidateSlug) => {
      const existing = await db.blogCategoryTranslation.findFirst({
        where: {
          slug: candidateSlug,
          language: payload.language,
          categoryId: {
            not: id,
          },
        },
        select: {
          id: true,
        },
      });

      return Boolean(existing);
    });

    const updated = await db.blogCategoryTranslation.upsert({
      where: {
        categoryId_language: {
          categoryId: id,
          language: payload.language,
        },
      },
      create: {
        category: {
          connect: {
            id,
          },
        },
        name: payload.name,
        slug: uniqueSlug,
        description: payload.description,
        language: payload.language,
      },
      update: {
        name: payload.name,
        slug: uniqueSlug,
        description: payload.description,
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
    const language = new URL(request.url).searchParams.get("language")?.trim();
    if (language) {
      await db.blogCategoryTranslation.delete({
        where: {
          categoryId_language: {
            categoryId: id,
            language,
          },
        },
      });
      const remaining = await db.blogCategoryTranslation.count({
        where: {
          categoryId: id,
        },
      });
      if (!remaining) {
        await db.blogCategory.delete({
          where: { id },
        });
      }
    } else {
      await db.blogCategory.delete({
        where: { id },
      });
    }

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
