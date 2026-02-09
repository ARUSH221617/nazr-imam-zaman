import { Link } from "@/i18n/routing";

interface BlogPaginationProps {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export function BlogPagination({ page, totalPages, buildHref }: BlogPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 pt-8">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
      >
        Prev
      </Link>
      <span className="text-sm text-muted-foreground">
        {page} / {totalPages}
      </span>
      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
      >
        Next
      </Link>
    </div>
  );
}

