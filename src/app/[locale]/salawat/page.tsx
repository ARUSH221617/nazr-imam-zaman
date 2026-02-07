"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Heart } from "lucide-react";

import { FloatingCounter } from "@/components/FloatingCounter";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCounter } from "@/hooks/useCounter";
import { Link } from "@/i18n/navigation";
import { isRTL, type Language } from "@/lib/translations";
import {
  footerPrayerClassName,
  footerPrayerStyle,
  prayerTextClassName,
  prayerTextStyle,
} from "@/lib/typography";

export default function SalawatPage() {
  const t = useTranslations();
  const locale = useLocale();
  const dir = isRTL(locale as Language) ? "rtl" : "ltr";

  // Use custom hooks
  const { count, incrementing, cooldown, increment } = useCounter(
    "salawat",
    5,
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-linear-to-br from-teal-900 via-cyan-800 to-teal-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30"
              >
                <ArrowRight
                  className={`h-4 w-4 ${dir === "rtl" ? "ml-2" : "mr-2"}`}
                />
                <span className="font-semibold">{t("common.back")}</span>
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{ fontFamily: "var(--font-vazirmatn)" }}
              >
                {t("common.siteName")}
              </h1>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="inline-block">
              <h2
                className="text-3xl md:text-5xl font-bold text-white"
                style={{ fontFamily: "var(--font-kitab)" }}
              >
                {t("common.bismillah")}
              </h2>
            </div>

            <div className="flex items-center justify-center gap-4 py-2">
              <div className="h-px w-16 bg-linear-to-r from-transparent via-yellow-400 to-transparent"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <div className="h-px w-16 bg-linear-to-r from-transparent via-yellow-400 to-transparent"></div>
            </div>

            <h3
              className="text-4xl md:text-6xl font-bold text-white"
              style={{ fontFamily: "var(--font-vazirmatn)" }}
            >
              {t("salawat.title")}
            </h3>
            <p
              className="text-lg text-teal-100"
              style={{ fontFamily: "var(--font-vazirmatn)" }}
            >
              {t("salawat.subtitle")}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="bg-linear-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 p-8 md:p-12 mb-8 transition-all duration-300">
            <div className="text-center space-y-8">
              {/* Arabic Text - Enhanced Visibility */}
              <div className="text-center space-y-6">
                <div className="bg-linear-to-br from-teal-50 via-cyan-50 to-teal-50 dark:from-teal-950/30 dark:via-cyan-950/30 dark:to-teal-950/30 p-8 md:p-10 rounded-2xl border-2 border-teal-200 dark:border-teal-700 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="h-px w-12 bg-linear-to-r from-transparent via-teal-400 to-transparent"></div>
                      <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
                      <div className="h-px w-12 bg-linear-to-r from-transparent via-teal-400 to-transparent"></div>
                    </div>
                    <div className="text-teal-800 dark:text-teal-200">
                      <p
                        className={prayerTextClassName}
                        style={prayerTextStyle}
                      >
                        {t("salawat.arabicText")}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 mt-2">
                      <div className="h-px w-12 bg-linear-to-r from-transparent via-teal-400 to-transparent"></div>
                      <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
                      <div className="h-px w-12 bg-linear-to-r from-transparent via-teal-400 to-transparent"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <FloatingCounter
            count={count}
            visible
            increment={increment}
            incrementing={incrementing}
            cooldown={cooldown}
            Icon={Heart}
            actionLabel={t("salawat.sendSalawat")}
          />

          {/* Info Card */}
          <Card className="bg-white border-2 border-yellow-200 p-6 md:p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Heart className="h-6 w-6 text-teal-600" />
                <h4
                  className="text-xl font-bold text-foreground"
                  style={{ fontFamily: "var(--font-vazirmatn)" }}
                >
                  {t("salawat.about")}
                </h4>
              </div>
              <p
                className="text-muted-foreground leading-relaxed"
                style={{ fontFamily: "var(--font-vazirmatn)" }}
              >
                {t("salawat.description")}
              </p>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-linear-to-br from-teal-900 to-cyan-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-2">
            <p
              className={footerPrayerClassName}
              style={footerPrayerStyle}
            >
              {t("common.footer.prayer")}
            </p>
            <p
              className="text-xs text-teal-200"
              style={{ fontFamily: "var(--font-vazirmatn)" }}
            >
              {t("common.footer.copyright", {
                year: new Date().getFullYear(),
              })}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
