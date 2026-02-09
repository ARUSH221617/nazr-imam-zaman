import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const language = searchParams.get("language")?.trim();
  const tags = await db.blogTagTranslation.findMany({
    where: language
      ? {
          language,
        }
      : undefined,
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
      name: tag.name,
      slug: tag.slug,
      language: tag.language,
      postCount: tag.tag._count.posts,
    })),
  });
}
