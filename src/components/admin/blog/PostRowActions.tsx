"use client";

import { BlogPostStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Link } from "@/i18n/routing";
import { useLanguage } from "@/hooks/use-language";

interface PostRowActionsProps {
  id: string;
  status: BlogPostStatus;
}

export function PostRowActions({ id, status }: PostRowActionsProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isBusy, setIsBusy] = useState(false);

  const run = async (request: () => Promise<Response>) => {
    setIsBusy(true);
    try {
      const response = await request();
      if (response.ok) {
        router.refresh();
      }
    } finally {
      setIsBusy(false);
    }
  };

  const togglePublish = async () => {
    const action = status === BlogPostStatus.PUBLISHED ? "unpublish" : "publish";
    await run(() =>
      fetch(`/api/admin/blog/posts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      }),
    );
  };

  const duplicate = async () => {
    await run(() =>
      fetch("/api/admin/blog/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sourceId: id }),
      }),
    );
  };

  const remove = async () => {
    if (!window.confirm(t("admin.blog.deleteConfirm"))) {
      return;
    }
    await run(() =>
      fetch(`/api/admin/blog/posts/${id}`, {
        method: "DELETE",
      }),
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/blog/${id}`}
        className="rounded-md border border-border px-2 py-1 text-xs text-foreground hover:bg-muted"
      >
        {t("admin.blog.edit")}
      </Link>
      <button
        type="button"
        onClick={togglePublish}
        disabled={isBusy}
        className="rounded-md border border-border px-2 py-1 text-xs text-foreground hover:bg-muted disabled:opacity-60"
      >
        {status === BlogPostStatus.PUBLISHED ? t("admin.blog.unpublish") : t("admin.blog.publish")}
      </button>
      <button
        type="button"
        onClick={duplicate}
        disabled={isBusy}
        className="rounded-md border border-border px-2 py-1 text-xs text-foreground hover:bg-muted disabled:opacity-60"
      >
        {t("admin.blog.duplicate")}
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={isBusy}
        className="rounded-md border border-destructive/40 px-2 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-60"
      >
        {t("admin.blog.delete")}
      </button>
    </div>
  );
}

