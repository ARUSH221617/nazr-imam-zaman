"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn, replaceVariables, getLocale, formatNumber } from "@/lib/utils";

interface FloatingCounterProps {
  count: number;
  visible: boolean;
  increment: () => void;
  incrementing: boolean;
  cooldown: number;
  Icon: LucideIcon;
  actionLabel: string;
}

export function FloatingCounter({
  count,
  visible,
  increment,
  incrementing,
  cooldown,
  Icon,
  actionLabel,
}: FloatingCounterProps) {
  const { t, language } = useLanguage();
  const locale = useMemo(() => getLocale(language), [language]);

  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-300 ease-out",
        visible
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
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Icon className="h-4 w-4" />
            <span style={{ fontFamily: "var(--font-vazirmatn)" }}>
              {actionLabel}
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
  );
}
