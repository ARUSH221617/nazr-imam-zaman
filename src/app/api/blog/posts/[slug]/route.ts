import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { buildVisiblePostsWhere } from "@/lib/blog/visibility";
import { calcReadingTime } from "@/lib/blog/reading-time";
import { getVisibleAt } from "@/lib/blog/dates";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const searchParams = new URL(request.url).searchParams;
  const language = searchParams.get("language")?.trim() || "fa";
  const now = new Date();

  const post = await db.blogPost.findFirst({
    where: {
      slug,
      ...buildVisiblePostsWhere({
        now,
        language,
      }),
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage,
    language: post.language,
    visibleAt: getVisibleAt(post).toISOString(),
    readingTime: calcReadingTime(post.content),
    category: post.category,
    tags: post.tags.map((postTag) => postTag.tag),
    author: post.author,
  });
}

