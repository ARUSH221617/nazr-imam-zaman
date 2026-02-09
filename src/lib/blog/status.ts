import { BlogPostStatus } from "@prisma/client";

interface ResolveStatusDatesInput {
  status: BlogPostStatus;
  publishAt: Date | null;
  existingPublishedAt?: Date | null;
}

export const resolveStatusDates = ({
  status,
  publishAt,
  existingPublishedAt = null,
}: ResolveStatusDatesInput): { publishAt: Date | null; publishedAt: Date | null } => {
  const now = new Date();

  if (status === BlogPostStatus.PUBLISHED) {
    return {
      publishAt,
      publishedAt: existingPublishedAt ?? now,
    };
  }

  if (status === BlogPostStatus.SCHEDULED) {
    if (!publishAt) {
      throw new Error("publishAt_required_for_scheduled");
    }

    return {
      publishAt,
      publishedAt: null,
    };
  }

  return {
    publishAt,
    publishedAt: null,
  };
};

