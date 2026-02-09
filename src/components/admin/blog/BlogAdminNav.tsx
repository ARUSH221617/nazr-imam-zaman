import { Link } from "@/i18n/routing";

interface BlogAdminNavProps {
  locale: string;
}

const navItems = [
  { href: "/admin/blog", label: "Posts" },
  { href: "/admin/blog/categories", label: "Categories" },
  { href: "/admin/blog/tags", label: "Tags" },
];

export function BlogAdminNav({ locale }: BlogAdminNavProps) {
  return (
    <nav className="flex flex-wrap gap-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          locale={locale}
          className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

