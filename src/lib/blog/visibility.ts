import { BlogPostStatus, type Prisma } from "@prisma/client";

interface BuildVisiblePostsWhereInput {
  now?: Date;
  language?: string;
  categoryId?: string;
  tagId?: string;
  search?: string;
}

export const buildVisiblePostsWhere = ({
  now = new Date(),
  language,
  categoryId,
  tagId,
  search,
}: BuildVisiblePostsWhereInput): Prisma.BlogPostWhereInput => {
  const filters: Prisma.BlogPostWhereInput[] = [
    {
      OR: [
        {
          status: BlogPostStatus.PUBLISHED,
          publishedAt: {
            lte: now,
          },
        },
        {
          status: BlogPostStatus.SCHEDULED,
          publishAt: {
            lte: now,
          },
        },
      ],
    },
  ];

  if (language) {
    filters.push({ language });
  }

  if (categoryId) {
    filters.push({ categoryId });
  }

  if (tagId) {
    filters.push({
      tags: {
        some: {
          tagId,
        },
      },
    });
  }

  const normalizedSearch = search?.trim();
  if (normalizedSearch) {
    filters.push({
      OR: [
        {
          title: {
            contains: normalizedSearch,
            mode: "insensitive",
          },
        },
        {
          excerpt: {
            contains: normalizedSearch,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: normalizedSearch,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  return {
    AND: filters,
  };
};

