import { NextResponse } from "next/server";

import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/blog/site-url";
import { buildVisiblePostsWhere } from "@/lib/blog/visibility";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const posts = await db.blogPostTranslation.findMany({
    where: {
      post: buildVisiblePostsWhere({ now }),
    },
    select: {
      slug: true,
      language: true,
      post: {
        select: {
          updatedAt: true,
          publishedAt: true,
          publishAt: true,
          createdAt: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  const staticUrls = routing.locales.map(
    (locale) => `
    <url>
      <loc>${siteUrl}/${locale}/blog</loc>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
    </url>`,
  );

  const postUrls = posts.map((post) => {
    const lastMod = (
      post.post.publishedAt ??
      post.post.publishAt ??
      post.post.createdAt
    ).toISOString();
    return `
    <url>
      <loc>${siteUrl}/${post.language}/blog/${post.slug}</loc>
      <lastmod>${lastMod}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...postUrls].join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
