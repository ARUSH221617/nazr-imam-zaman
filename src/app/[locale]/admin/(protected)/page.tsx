import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { prayerTextClassName, prayerTextStyle } from "@/lib/typography";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const counterDefinitions = [
  { name: "salawat", labelKey: "home.salawat.title" },
  { name: "dua_faraj", labelKey: "duaSalamati.title" },
  { name: "dua_khasa", labelKey: "duaFaraj.title" },
];

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const counters = await db.counter.findMany({
    select: {
      name: true,
      count: true,
    },
  });
  const countsByName = new Map(counters.map((counter) => [counter.name, counter.count]));
  const formattedCounters = counterDefinitions.map((definition) => ({
    name: definition.name,
    label: t(definition.labelKey),
    count: countsByName.get(definition.name) ?? 0,
  }));
  const total = formattedCounters.reduce((sum, counter) => sum + counter.count, 0);
  const numberFormatter = new Intl.NumberFormat(locale);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2
          className={cn(prayerTextClassName, "text-foreground")}
          style={prayerTextStyle}
        >
          {t("admin.title")}
        </h2>
        <p
          className="text-sm text-muted-foreground"
          style={{ fontFamily: "var(--font-vazirmatn)" }}
        >
          {t("admin.nav.blog")} · {t("admin.nav.gallery")}
        </p>
      </div>
      <section className="space-y-4">
        <h3
          className={cn(prayerTextClassName, "text-foreground")}
          style={prayerTextStyle}
        >
          {t("admin.overview.title")}
        </h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-dashed border-border bg-background p-6">
            <p
              className="text-sm text-muted-foreground"
              style={{ fontFamily: "var(--font-vazirmatn)" }}
            >
              {t("admin.overview.total")}
            </p>
            <p
              className={cn(prayerTextClassName, "mt-3 text-foreground")}
              style={prayerTextStyle}
            >
              {numberFormatter.format(total)}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <p
            className="text-sm text-muted-foreground"
            style={{ fontFamily: "var(--font-vazirmatn)" }}
          >
            {t("admin.overview.counters")}
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {formattedCounters.map((counter) => (
              <div
                key={counter.name}
                className="rounded-xl border border-dashed border-border bg-background p-6"
              >
                <p
                  className="text-sm text-muted-foreground"
                  style={{ fontFamily: "var(--font-vazirmatn)" }}
                >
                  {counter.label}
                </p>
                <p
                  className={cn(prayerTextClassName, "mt-3 text-foreground")}
                  style={prayerTextStyle}
                >
                  {numberFormatter.format(counter.count)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-dashed border-border bg-background p-6">
          <h3
            className="text-lg font-semibold text-foreground"
            style={{ fontFamily: "var(--font-vazirmatn)" }}
          >
            {t("admin.nav.blog")}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            /admin/blog
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-background p-6">
          <h3
            className="text-lg font-semibold text-foreground"
            style={{ fontFamily: "var(--font-vazirmatn)" }}
          >
            {t("admin.nav.gallery")}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            /admin/gallery
          </p>
        </div>
      </div>
    </div>
  );
}
