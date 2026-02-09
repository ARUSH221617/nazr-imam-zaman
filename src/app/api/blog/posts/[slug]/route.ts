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

  const post = await db.blogPostTranslation.findFirst({
    where: {
      slug,
      language,
      post: buildVisiblePostsWhere({
        now,
        language,
      }),
    },
    include: {
      post: {
        include: {
          category: {
            select: {
              id: true,
              translations: {
                where: {
                  language,
                },
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  translations: {
                    where: {
                      language,
                    },
                    select: {
                      name: true,
                      slug: true,
                    },
                  },
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
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    id: post.postId,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage,
    language: post.language,
    visibleAt: getVisibleAt(post.post).toISOString(),
    readingTime: calcReadingTime(post.content),
    category: post.post.category?.translations[0]
      ? {
          id: post.post.category.id,
          name: post.post.category.translations[0].name,
          slug: post.post.category.translations[0].slug,
        }
      : null,
    tags: post.post.tags.map((postTag) => ({
      id: postTag.tag.id,
      name: postTag.tag.translations[0]?.name ?? "",
      slug: postTag.tag.translations[0]?.slug ?? "",
    })),
    author: post.post.author,
  });
}
