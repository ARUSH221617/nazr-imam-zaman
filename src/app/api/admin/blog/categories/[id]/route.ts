import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminCookies } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { blogCategoryInputSchema } from "@/lib/blog/schemas";
import { ensureUniqueSlug, slugify } from "@/lib/blog/slug";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdminCookies();
  if (authError) {
    return authError;
  }

  const { id } = await params;
  const category = await db.blogCategory.findUnique({
    where: { id },
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
    const uniqueSlug = await ensureUniqueSlug(baseSlug, async (candidateSlug) =>
      Boolean(
        await db.blogCategory.findFirst({
          where: {
            slug: candidateSlug,
            language: payload.language,
            id: {
              not: id,
            },
          },
          select: {
            id: true,
          },
        }),
      ),
    );

    const updated = await db.blogCategory.update({
      where: { id },
      data: {
        name: payload.name,
        slug: uniqueSlug,
        description: payload.description,
        language: payload.language,
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
    await db.blogCategory.delete({
      where: { id },
    });

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}

