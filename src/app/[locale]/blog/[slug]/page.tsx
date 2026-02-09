import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { SafeImage } from "@/components/blog/SafeImage";
import { Link } from "@/i18n/routing";
import { calcReadingTime } from "@/lib/blog/reading-time";
import { formatDate, getVisibleAt } from "@/lib/blog/dates";
import { getSiteUrl } from "@/lib/blog/site-url";
import { buildVisiblePostsWhere } from "@/lib/blog/visibility";
import { db } from "@/lib/db";

const fetchVisiblePost = async (slug: string, locale: string) => {
  return db.blogPost.findFirst({
    where: {
      slug,
      ...buildVisiblePostsWhere({
        language: locale,
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
    },
  });
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await fetchVisiblePost(slug, locale);

  if (!post) {
    return {};
  }

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/${locale}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      url: canonicalUrl,
      type: "article",
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale });
  const post = await fetchVisiblePost(slug, locale);

  if (!post) {
    notFound();
  }

  const readingTime = calcReadingTime(post.content);
  const visibleAt = getVisibleAt(post);
  const postTagIds = post.tags.map((postTag) => postTag.tagId);
  const relatedPosts = await db.blogPost.findMany({
    where: {
      id: {
        not: post.id,
      },
      ...buildVisiblePostsWhere({
        language: locale,
      }),
      OR: [
        ...(post.categoryId ? [{ categoryId: post.categoryId }] : []),
        ...(postTagIds.length
          ? [
              {
                tags: {
                  some: {
                    tagId: {
                      in: postTagIds,
                    },
                  },
                },
              },
            ]
          : []),
      ],
    },
    take: 4,
    orderBy: [{ publishedAt: "desc" }, { publishAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
    },
  });

  return (
    <main className="container mx-auto min-h-screen space-y-8 px-4 py-10">
      <article className="mx-auto max-w-3xl space-y-6">
        {post.coverImage ? (
          <SafeImage
            src={post.coverImage}
            alt={post.title}
            width={1400}
            height={800}
            className="h-auto w-full rounded-xl border border-border object-cover"
          />
        ) : null}
        <header className="space-y-3">
          <h1 className="text-4xl font-semibold text-foreground" style={{ fontFamily: "var(--font-vazirmatn)" }}>
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{formatDate(visibleAt, locale)}</span>
            <span>{readingTime} min read</span>
            {post.category ? (
              <Link href={`/blog/category/${post.category.slug}`} className="text-primary">
                {post.category.name}
              </Link>
            ) : null}
          </div>
          {post.tags.length ? (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((postTag) => (
                <Link
                  key={postTag.tagId}
                  href={`/blog/tag/${postTag.tag.slug}`}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-primary"
                >
                  #{postTag.tag.name}
                </Link>
              ))}
            </div>
          ) : null}
        </header>

        <div className="prose prose-slate max-w-none text-foreground">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={{
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  rel="nofollow noopener noreferrer"
                  target={props.href?.startsWith("http") ? "_blank" : undefined}
                  className="text-primary underline underline-offset-4"
                />
              ),
              img: ({ node, ...props }) => {
                const src = typeof props.src === "string" ? props.src : "";
                const alt = typeof props.alt === "string" ? props.alt : "";
                if (!src) {
                  return null;
                }

                if (src.startsWith("/")) {
                  return (
                    <SafeImage
                      src={src}
                      alt={alt}
                      width={1200}
                      height={700}
                      className="h-auto w-full rounded-lg border border-border"
                    />
                  );
                }

                return (
                  <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    className="h-auto w-full rounded-lg border border-border"
                  />
                );
              },
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>

      {relatedPosts.length ? (
        <section className="mx-auto max-w-3xl space-y-4">
          <h2 className="text-xl font-semibold text-foreground" style={{ fontFamily: "var(--font-vazirmatn)" }}>
            {t("blog.relatedPosts")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.id}
                href={`/blog/${relatedPost.slug}`}
                className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-primary/5"
              >
                <h3 className="text-base font-semibold text-foreground">{relatedPost.title}</h3>
                {relatedPost.excerpt ? (
                  <p className="mt-2 text-sm text-muted-foreground">{relatedPost.excerpt}</p>
                ) : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

