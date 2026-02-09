import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminCookies } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { blogTagInputSchema } from "@/lib/blog/schemas";
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
  const tag = await db.blogTag.findUnique({
    where: { id },
  });

  if (!tag) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ item: tag });
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
    const payload = blogTagInputSchema.parse(await request.json());
    const baseSlug = payload.slug || slugify(payload.name) || `tag-${Date.now()}`;
    const uniqueSlug = await ensureUniqueSlug(baseSlug, async (candidateSlug) =>
      Boolean(
        await db.blogTag.findFirst({
          where: {
            slug: candidateSlug,
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

    const updated = await db.blogTag.update({
      where: { id },
      data: {
        name: payload.name,
        slug: uniqueSlug,
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
    await db.blogTag.delete({
      where: { id },
    });

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}

