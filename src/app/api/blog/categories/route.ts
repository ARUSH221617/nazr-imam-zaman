import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const language = searchParams.get("language")?.trim();

  const categories = await db.blogCategory.findMany({
    where: language
      ? {
          language,
        }
      : undefined,
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
    items: categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      language: category.language,
      postCount: category._count.posts,
    })),
  });
}

