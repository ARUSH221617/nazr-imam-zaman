"use client";

import { useState } from "react";

import { useLanguage } from "@/hooks/use-language";

interface CategoryItem {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  language: string;
  postCount?: number;
}

interface CategoryFormProps {
  initialCategories: CategoryItem[];
}

const initialFormState = {
  id: "",
  categoryId: "",
  name: "",
  slug: "",
  description: "",
  language: "fa",
};

export function CategoryForm({ initialCategories }: CategoryFormProps) {
  const { t } = useLanguage();
  const [categories, setCategories] = useState(initialCategories);
  const [formState, setFormState] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCategories = async () => {
    const response = await fetch("/api/admin/blog/categories", {
      method: "GET",
    });

    if (!response.ok) {
      return;
    }

    const payload = await response.json().catch(() => null);
    if (payload?.items) {
      setCategories(payload.items);
    }
  };

  const onEdit = (category: CategoryItem) => {
    setFormState({
      id: category.id,
      categoryId: category.categoryId,
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      language: category.language,
    });
  };

  const onDelete = async (categoryId: string, language: string) => {
    if (!window.confirm(t("admin.blog.deleteConfirm"))) {
      return;
    }

    const response = await fetch(
      `/api/admin/blog/categories/${categoryId}?language=${language}`,
      {
      method: "DELETE",
      },
    );

    if (response.ok) {
      await refreshCategories();
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const isEdit = Boolean(formState.id);
      const endpoint = isEdit
        ? `/api/admin/blog/categories/${formState.id}`
        : "/api/admin/blog/categories";
      const method = isEdit ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId: formState.categoryId || null,
          name: formState.name,
          slug: formState.slug || null,
          description: formState.description || null,
          language: formState.language,
        }),
      });

      if (!response.ok) {
        setError(t("admin.blog.saveError"));
        return;
      }

      setFormState(initialFormState);
      await refreshCategories();
    } catch {
      setError(t("admin.blog.saveError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-6">
        <select
          value={formState.categoryId}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, categoryId: event.target.value }))
          }
          disabled={Boolean(formState.id)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
        >
          <option value="">{t("admin.blog.form.none")}</option>
          {categories.map((category) => (
            <option key={`${category.categoryId}-${category.language}`} value={category.categoryId}>
              {category.name} ({category.language})
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
        <input
          value={formState.description}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, description: event.target.value }))
          }
          placeholder={t("admin.blog.form.description")}
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
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
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
        </div>
      </form>
      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="space-y-3">
        {categories.map((category) => (
          <div
            key={`${category.categoryId}-${category.language}`}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="font-medium text-foreground">{category.name}</p>
              <p className="text-sm text-muted-foreground">
                {category.slug} ({category.language}) · {category.postCount ?? 0} posts
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(category)}
                className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
              >
                {t("admin.blog.edit")}
              </button>
              <button
                type="button"
                onClick={() => onDelete(category.categoryId, category.language)}
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
