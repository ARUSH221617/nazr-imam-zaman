"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { cn, replaceVariables, getLocale, formatNumber } from "@/lib/utils";
import { useCounter } from "@/hooks/useCounter";
import { useScrollDetection } from "@/hooks/useScrollDetection";

export default function SalawatPage() {
  const { t, language, dir } = useLanguage();

  // Use custom hooks
  const {
    count,
    loading,
    incrementing,
    cooldown,
    error,
    increment,
  } = useCounter("salawat", 5);

  const { scrolled, substantialScroll } = useScrollDetection();

  const locale = useMemo(() => getLocale(language), [language]);

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
                <span className="font-semibold">{t.common.back}</span>
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{ fontFamily: "var(--font-vazirmatn)" }}
              >
                {t.common.siteName}
              </h1>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="inline-block">
              <h2
                className="text-3xl md:text-5xl font-bold text-white"
                style={{ fontFamily: "var(--font-kitab)" }}
              >
                {t.common.bismillah}
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
              {t.salawat.title}
            </h3>
            <p
              className="text-lg text-teal-100"
              style={{ fontFamily: "var(--font-vazirmatn)" }}
            >
              {t.salawat.subtitle}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Counter Card - Shows when at top */}
          <Card className="bg-linear-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 p-8 md:p-12 mb-8 transition-all duration-300">
            <div className="text-center space-y-8">
              {!substantialScroll && (
                <>
                  {/* Counter Display */}
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 text-teal-600 mb-4">
                      <TrendingUp className="h-6 w-6" />
                      <span
                        className="font-semibold"
                        style={{ fontFamily: "var(--font-vazirmatn)" }}
                      >
                        {t.common.total}
                      </span>
                    </div>

                    {loading ? (
                      <div className="text-6xl md:text-8xl font-bold text-teal-700">
                        <span className="animate-pulse">...</span>
                      </div>
                    ) : (
                      <div className="text-6xl md:text-8xl font-bold text-teal-700 transition-all duration-300">
                        {formatNumber(count, locale)}
                      </div>
                    )}

                    {/* Rate Limit Indicator */}
                    {cooldown > 0 && (
                      <div className="flex items-center justify-center gap-2 text-sm text-orange-600 animate-pulse">
                        <span
                          className="font-semibold"
                          style={{ fontFamily: "var(--font-vazirmatn)" }}
                        >
                          {replaceVariables(t.common.cooldown, {
                            seconds: cooldown,
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="space-y-4">
                    <Button
                      onClick={increment}
                      disabled={incrementing || cooldown > 0}
                      size="lg"
                      className="w-full md:w-auto px-12 py-6 text-xl font-bold bg-linear-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white border-0 shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                    >
                      <Heart
                        className={`h-6 w-6 ${dir === "rtl" ? "ml-3" : "mr-3"}`}
                      />
                      <span style={{ fontFamily: "var(--font-vazirmatn)" }}>
                        {t.salawat.sendSalawat}
                      </span>
                      <Heart
                        className={`h-6 w-6 ${dir === "rtl" ? "mr-3" : "ml-3"}`}
                      />
                    </Button>

                    {/* Error Message */}
                    {error && (
                      <div
                        className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-center"
                        style={{ fontFamily: "var(--font-vazirmatn)" }}
                      >
                        {error}
                      </div>
                    )}
                  </div>

                  {/* Decorative Divider */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-px w-24 bg-linear-to-r from-transparent via-teal-400 to-transparent"></div>
                    <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                    <div className="h-px w-24 bg-linear-to-r from-transparent via-teal-400 to-transparent"></div>
                  </div>
                </>
              )}

              {/* Arabic Text - Enhanced Visibility */}
              <div className="text-center space-y-6">
                <div className="bg-linear-to-br from-teal-50 via-cyan-50 to-teal-50 dark:from-teal-950/30 dark:via-cyan-950/30 dark:to-teal-950/30 p-8 md:p-10 rounded-2xl border-2 border-teal-200 dark:border-teal-700 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="h-px w-12 bg-linear-to-r from-transparent via-teal-400 to-transparent"></div>
                      <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
                      <div className="h-px w-12 bg-linear-to-r from-transparent via-teal-400 to-transparent"></div>
                    </div>
                    <p
                      className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-teal-800 dark:text-teal-200 leading-relaxed tracking-wide"
                      style={{ fontFamily: "var(--font-kitab)" }}
                    >
                      {t.salawat.arabicText}
                    </p>
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

          {/* Floating Counter */}
          {substantialScroll && (
            <div
              className={cn(
                "fixed z-50 transition-all duration-300 ease-out",
                substantialScroll
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4",
                "bottom-4 left-1/2 translate-x-[-50%] md:bottom-4 md:left-auto md:right-4 md:translate-x-0",
              )}
            >
              {/* Glass morphism design */}
              <div className="bg-linear-to-r from-teal-600/90 via-cyan-600/90 to-teal-600/90 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-2xl p-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Counter display */}
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white">
                      {formatNumber(count, locale)}
                    </span>
                    <span className="text-sm text-white/80">
                      {t.common.total}
                    </span>
                  </div>
                  {/* Action button */}
                  <Button
                    onClick={increment}
                    disabled={incrementing || cooldown > 0}
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/40"
                  >
                    <Heart className="h-4 w-4" />
                    <span style={{ fontFamily: "var(--font-vazirmatn)" }}>
                      {t.salawat.sendSalawat}
                    </span>
                  </Button>
                </div>
                {/* Cooldown indicator */}
                {cooldown > 0 && (
                  <div className="text-center text-xs text-orange-200 mt-2 animate-pulse">
                    <span
                      className="font-semibold"
                      style={{ fontFamily: "var(--font-vazirmatn)" }}
                    >
                      {replaceVariables(t.common.cooldown, {
                        seconds: cooldown,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Card */}
          <Card className="bg-white border-2 border-yellow-200 p-6 md:p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Heart className="h-6 w-6 text-teal-600" />
                <h4
                  className="text-xl font-bold text-foreground"
                  style={{ fontFamily: "var(--font-vazirmatn)" }}
                >
                  {t.salawat.about}
                </h4>
              </div>
              <p
                className="text-muted-foreground leading-relaxed"
                style={{ fontFamily: "var(--font-vazirmatn)" }}
              >
                {t.salawat.description}
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
              className="text-sm"
              style={{ fontFamily: "var(--font-vazirmatn)" }}
            >
              {t.common.footer.prayer}
            </p>
            <p
              className="text-xs text-teal-200"
              style={{ fontFamily: "var(--font-vazirmatn)" }}
            >
              {replaceVariables(t.common.footer.copyright, {
                year: new Date().getFullYear(),
              })}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
