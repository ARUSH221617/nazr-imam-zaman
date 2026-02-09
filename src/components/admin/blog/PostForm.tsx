"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BlogPostStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { MarkdownEditor } from "@/components/admin/blog/MarkdownEditor";
import { useLanguage } from "@/hooks/use-language";

const postFormSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().default(""),
  coverImage: z.string().optional(),
  status: z.nativeEnum(BlogPostStatus),
  language: z.enum(["fa", "ar", "en"]),
  publishAt: z.string().optional(),
  categoryId: z.string().optional(),
  authorId: z.string().optional(),
  tagIds: z.array(z.string()).default([]),
});

type PostFormValues = z.infer<typeof postFormSchema>;

interface PostFormProps {
  locale: string;
  mode: "create" | "edit";
  postId?: string;
  categories: Array<{ id: string; name: string; language: string }>;
  tags: Array<{ id: string; name: string }>;
  authors: Array<{ id: string; name: string | null; email: string }>;
  initialValues?: {
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    status: BlogPostStatus;
    language: string;
    publishAt: Date | null;
    categoryId: string | null;
    authorId: string | null;
    tagIds: string[];
  };
}

const toDateTimeLocalValue = (date: Date | null | undefined): string => {
  if (!date) {
    return "";
  }

  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().slice(0, 16);
};

export function PostForm({
  locale,
  mode,
  postId,
  categories,
  tags,
  authors,
  initialValues,
}: PostFormProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const defaultValues = useMemo<PostFormValues>(
    () => ({
      title: initialValues?.title ?? "",
      slug: initialValues?.slug ?? "",
      excerpt: initialValues?.excerpt ?? "",
      content: initialValues?.content ?? "",
      coverImage: initialValues?.coverImage ?? "",
      status: initialValues?.status ?? BlogPostStatus.DRAFT,
      language:
        initialValues?.language === "fa" ||
        initialValues?.language === "ar" ||
        initialValues?.language === "en"
          ? initialValues.language
          : "fa",
      publishAt: toDateTimeLocalValue(initialValues?.publishAt),
      categoryId: initialValues?.categoryId ?? "",
      authorId: initialValues?.authorId ?? "",
      tagIds: initialValues?.tagIds ?? [],
    }),
    [initialValues],
  );

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues,
  });

  const handleUpload = async () => {
    if (!uploadFile) {
      return;
    }

    setIsUploading(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.url) {
        setSubmitError(t("admin.blog.uploadError"));
        return;
      }

      form.setValue("coverImage", payload.url, {
        shouldDirty: true,
      });
      setUploadFile(null);
    } catch {
      setSubmitError(t("admin.blog.uploadError"));
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        ...values,
        slug: values.slug?.trim() || null,
        excerpt: values.excerpt?.trim() || null,
        coverImage: values.coverImage?.trim() || null,
        publishAt: values.publishAt ? new Date(values.publishAt).toISOString() : null,
        categoryId: values.categoryId || null,
        authorId: values.authorId || null,
      };

      const endpoint =
        mode === "create" ? "/api/admin/blog/posts" : `/api/admin/blog/posts/${postId}`;
      const method = mode === "create" ? "POST" : "PUT";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responsePayload = await response.json().catch(() => ({}));
        const messageMap: Record<string, string> = {
          publishAt_required_for_scheduled: t("admin.blog.publishAtRequired"),
        };
        setSubmitError(messageMap[responsePayload.error] ?? t("admin.blog.saveError"));
        return;
      }

      router.push(`/${locale}/admin/blog`);
      router.refresh();
    } catch {
      setSubmitError(t("admin.blog.saveError"));
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.blog.form.title")}</label>
          <input
            {...form.register("title")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.blog.form.slug")}</label>
          <input
            {...form.register("slug")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{t("admin.blog.form.excerpt")}</label>
        <textarea
          {...form.register("excerpt")}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.blog.form.status")}</label>
          <select
            {...form.register("status")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {Object.values(BlogPostStatus).map((status) => (
              <option key={status} value={status}>
                {t(`admin.blog.status.${status.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.blog.form.language")}</label>
          <select
            {...form.register("language")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="fa">Farsi</option>
            <option value="ar">Arabic</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.blog.form.publishAt")}</label>
          <input
            type="datetime-local"
            {...form.register("publishAt")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.blog.form.author")}</label>
          <select
            {...form.register("authorId")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">{t("admin.blog.form.none")}</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name ? `${author.name} (${author.email})` : author.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.blog.form.category")}</label>
          <select
            {...form.register("categoryId")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">{t("admin.blog.form.none")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.language})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("admin.blog.form.tags")}</label>
          <Controller
            control={form.control}
            name="tagIds"
            render={({ field }) => (
              <select
                multiple
                value={field.value}
                onChange={(event) => {
                  const selected = Array.from(event.target.selectedOptions).map(
                    (option) => option.value,
                  );
                  field.onChange(selected);
                }}
                className="h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{t("admin.blog.form.coverImage")}</label>
        <input
          {...form.register("coverImage")}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="https://..."
        />
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
            className="text-sm"
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={!uploadFile || isUploading}
            className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-muted disabled:opacity-60"
          >
            {isUploading ? t("admin.blog.uploading") : t("admin.blog.upload")}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{t("admin.blog.form.content")}</label>
        <Controller
          control={form.control}
          name="content"
          render={({ field }) => (
            <MarkdownEditor value={field.value ?? ""} onChange={field.onChange} />
          )}
        />
      </div>

      {submitError ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {submitError}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {isSubmitting ? t("admin.blog.saving") : t("admin.blog.save")}
        </button>
      </div>
    </form>
  );
}

