import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET() {
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
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      postCount: tag._count.posts,
    })),
  });
}

