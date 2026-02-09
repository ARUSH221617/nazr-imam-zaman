import { Link } from "@/i18n/routing";

import { calcReadingTime } from "@/lib/blog/reading-time";
import { formatDate, getVisibleAt } from "@/lib/blog/dates";
import { SafeImage } from "@/components/blog/SafeImage";

interface BlogPostCardProps {
  post: {
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    publishedAt: Date | null;
    publishAt: Date | null;
    createdAt: Date;
    category: {
      name: string;
      slug: string;
    } | null;
  };
  locale: string;
}

export function BlogPostCard({ post, locale }: BlogPostCardProps) {
  const visibleAt = getVisibleAt(post);
  const readingTime = calcReadingTime(post.content);

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      {post.coverImage ? (
        <SafeImage
          src={post.coverImage}
          alt={post.title}
          width={1200}
          height={640}
          className="h-52 w-full object-cover"
        />
      ) : null}
      <div className="space-y-3 p-6">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>{formatDate(visibleAt, locale)}</span>
          <span>{readingTime} min read</span>
          {post.category ? (
            <Link href={`/blog/category/${post.category.slug}`} className="text-primary">
              {post.category.name}
            </Link>
          ) : null}
        </div>
        <h2 className="text-2xl font-semibold text-foreground" style={{ fontFamily: "var(--font-vazirmatn)" }}>
          <Link href={`/blog/${post.slug}`} className="hover:text-primary">
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? <p className="text-sm text-muted-foreground">{post.excerpt}</p> : null}
      </div>
    </article>
  );
}

