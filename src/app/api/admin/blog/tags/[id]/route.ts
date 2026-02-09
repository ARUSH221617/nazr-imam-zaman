import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminCookies } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { blogTagInputSchema } from "@/lib/blog/schemas";
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
  const tag = language
    ? await db.blogTagTranslation.findUnique({
        where: {
          tagId_language: {
            tagId: id,
            language,
          },
        },
      })
    : await db.blogTagTranslation.findFirst({
        where: {
          tagId: id,
        },
        orderBy: {
          language: "asc",
        },
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
    const uniqueSlug = await ensureUniqueSlug(baseSlug, async (candidateSlug) => {
      const existing = await db.blogTagTranslation.findFirst({
        where: {
          slug: candidateSlug,
          language: payload.language,
          tagId: {
            not: id,
          },
        },
        select: {
          id: true,
        },
      });

      return Boolean(existing);
    });

    const updated = await db.blogTagTranslation.upsert({
      where: {
        tagId_language: {
          tagId: id,
          language: payload.language,
        },
      },
      create: {
        tag: {
          connect: {
            id,
          },
        },
        name: payload.name,
        slug: uniqueSlug,
        language: payload.language,
      },
      update: {
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
  request: Request,
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
      await db.blogTagTranslation.delete({
        where: {
          tagId_language: {
            tagId: id,
            language,
          },
        },
      });
      const remaining = await db.blogTagTranslation.count({
        where: {
          tagId: id,
        },
      });
      if (!remaining) {
        await db.blogTag.delete({
          where: { id },
        });
      }
    } else {
      await db.blogTag.delete({
        where: { id },
      });
    }

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
