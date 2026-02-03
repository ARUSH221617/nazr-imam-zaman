import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function replaceVariables(
  text: string,
  variables: Record<string, string | number>,
): string {
  let result = text;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), String(value));
  });
  return result;
}

export function getLocale(language: string): string {
  if (language === "fa") return "fa-IR";
  if (language === "ar") return "ar-SA";
  return "en-US";
}

export function formatNumber(num: number, locale: string): string {
  return num.toLocaleString(locale);
}
