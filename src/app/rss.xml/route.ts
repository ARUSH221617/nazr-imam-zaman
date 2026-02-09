import { NextResponse } from "next/server";

import { getSiteUrl } from "@/lib/blog/site-url";
import { getVisibleAt } from "@/lib/blog/dates";
import { buildVisiblePostsWhere } from "@/lib/blog/visibility";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const posts = await db.blogPostTranslation.findMany({
    where: {
      post: buildVisiblePostsWhere({ now }),
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 20,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      language: true,
      post: {
        select: {
          publishedAt: true,
          publishAt: true,
          createdAt: true,
        },
      },
    },
  });

  const items = posts
    .map((post) => {
      const url = `${siteUrl}/${post.language}/blog/${post.slug}`;
      const pubDate = getVisibleAt(post.post).toUTCString();
      const description = post.excerpt ?? post.content.slice(0, 160);

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid>${escapeXml(url)}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Blog</title>
    <link>${escapeXml(`${siteUrl}/fa/blog`)}</link>
    <description>Latest blog posts</description>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
