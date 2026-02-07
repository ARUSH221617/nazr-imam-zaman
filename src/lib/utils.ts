import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLocale(language: string): string {
  if (language === "fa") return "fa-IR";
  if (language === "ar") return "ar-SA";
  return "en-US";
}

export function formatNumber(num: number, locale: string): string {
  return num.toLocaleString(locale);
}
