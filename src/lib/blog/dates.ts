interface VisibleDateInput {
  publishedAt: Date | null;
  publishAt: Date | null;
  createdAt: Date;
}

export const getVisibleAt = (post: VisibleDateInput): Date => {
  return post.publishedAt ?? post.publishAt ?? post.createdAt;
};

export const formatDate = (date: Date, locale: string): string => {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

