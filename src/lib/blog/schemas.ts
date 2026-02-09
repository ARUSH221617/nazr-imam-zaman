import { BlogPostStatus } from "@prisma/client";
import { z } from "zod";

const nullableTrimmedString = z
  .string()
  .optional()
  .transform((value) => value?.trim() ?? "")
  .transform((value) => (value.length ? value : null));

const nullableDate = z
  .union([z.string(), z.date(), z.null(), z.undefined()])
  .transform((value) => {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return value;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  });

const pageSchema = z.coerce.number().int().min(1).default(1);
const pageSizeSchema = z.coerce.number().int().min(1).max(50).default(10);

export const publicPostsQuerySchema = z.object({
  page: pageSchema,
  pageSize: pageSizeSchema,
  q: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  language: z.string().optional(),
});

export const adminPostsQuerySchema = z.object({
  page: pageSchema,
  pageSize: pageSizeSchema,
  q: z.string().optional(),
  status: z.nativeEnum(BlogPostStatus).optional(),
  language: z.string().optional(),
  categoryId: z.string().optional(),
});

export const blogPostInputSchema = z.object({
  title: z.string().trim().min(1),
  slug: nullableTrimmedString,
  excerpt: nullableTrimmedString,
  content: z.string().default(""),
  coverImage: nullableTrimmedString,
  status: z.nativeEnum(BlogPostStatus).default(BlogPostStatus.DRAFT),
  language: z.string().trim().min(1).default("fa"),
  publishAt: nullableDate,
  categoryId: nullableTrimmedString,
  authorId: nullableTrimmedString,
  tagIds: z.array(z.string().min(1)).default([]),
});

export const blogPostDuplicateSchema = z.object({
  sourceId: z.string().min(1),
});

export const blogPostPatchSchema = z.object({
  action: z.enum(["publish", "unpublish", "archive"]),
});

export const blogCategoryInputSchema = z.object({
  categoryId: nullableTrimmedString,
  name: z.string().trim().min(1),
  slug: nullableTrimmedString,
  description: nullableTrimmedString,
  language: z.string().trim().min(1).default("fa"),
});

export const blogTagInputSchema = z.object({
  tagId: nullableTrimmedString,
  name: z.string().trim().min(1),
  slug: nullableTrimmedString,
  language: z.string().trim().min(1).default("fa"),
});

export type BlogPostInput = z.infer<typeof blogPostInputSchema>;
