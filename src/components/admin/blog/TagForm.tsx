"use client";

import { useState } from "react";

import { useLanguage } from "@/hooks/use-language";

interface TagItem {
  id: string;
  tagId: string;
  name: string;
  slug: string;
  language: string;
  postCount?: number;
}

interface TagFormProps {
  initialTags: TagItem[];
}

const initialFormState = {
  id: "",
  tagId: "",
  name: "",
  slug: "",
  language: "fa",
};

export function TagForm({ initialTags }: TagFormProps) {
  const { t } = useLanguage();
  const [tags, setTags] = useState(initialTags);
  const [formState, setFormState] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTags = async () => {
    const response = await fetch("/api/admin/blog/tags", {
      method: "GET",
    });

    if (!response.ok) {
      return;
    }

    const payload = await response.json().catch(() => null);
    if (payload?.items) {
      setTags(payload.items);
    }
  };

  const onEdit = (tag: TagItem) => {
    setFormState({
      id: tag.id,
      tagId: tag.tagId,
      name: tag.name,
      slug: tag.slug,
      language: tag.language,
    });
  };

  const onDelete = async (tagId: string, language: string) => {
    if (!window.confirm(t("admin.blog.deleteConfirm"))) {
      return;
    }

    const response = await fetch(`/api/admin/blog/tags/${tagId}?language=${language}`, {
      method: "DELETE",
    });

    if (response.ok) {
      await refreshTags();
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const isEdit = Boolean(formState.id);
      const endpoint = isEdit
        ? `/api/admin/blog/tags/${formState.id}`
        : "/api/admin/blog/tags";
      const method = isEdit ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tagId: formState.tagId || null,
          name: formState.name,
          slug: formState.slug || null,
          language: formState.language,
        }),
      });

      if (!response.ok) {
        setError(t("admin.blog.saveError"));
        return;
      }

      setFormState(initialFormState);
      await refreshTags();
    } catch {
      setError(t("admin.blog.saveError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-5">
        <select
          value={formState.tagId}
          onChange={(event) => setFormState((prev) => ({ ...prev, tagId: event.target.value }))}
          disabled={Boolean(formState.id)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
        >
          <option value="">{t("admin.blog.form.none")}</option>
          {tags.map((tag) => (
            <option key={`${tag.tagId}-${tag.language}`} value={tag.tagId}>
              {tag.name} ({tag.language})
            </option>
          ))}
        </select>
        <input
          value={formState.name}
          onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
          placeholder={t("admin.blog.form.name")}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <input
          value={formState.slug}
          onChange={(event) => setFormState((prev) => ({ ...prev, slug: event.target.value }))}
          placeholder={t("admin.blog.form.slug")}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <select
          value={formState.language}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, language: event.target.value }))
          }
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="fa">Farsi</option>
          <option value="ar">Arabic</option>
          <option value="en">English</option>
        </select>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {isSubmitting ? t("admin.blog.saving") : t("admin.blog.save")}
        </button>
        {formState.id ? (
          <button
            type="button"
            onClick={() => setFormState(initialFormState)}
            className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
          >
            {t("admin.blog.cancel")}
          </button>
        ) : null}
      </form>
      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="space-y-3">
        {tags.map((tag) => (
          <div
            key={`${tag.tagId}-${tag.language}`}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="font-medium text-foreground">{tag.name}</p>
              <p className="text-sm text-muted-foreground">
                {tag.slug} ({tag.language}) · {tag.postCount ?? 0} posts
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(tag)}
                className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
              >
                {t("admin.blog.edit")}
              </button>
              <button
                type="button"
                onClick={() => onDelete(tag.tagId, tag.language)}
                className="rounded-md border border-destructive/40 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
              >
                {t("admin.blog.delete")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
