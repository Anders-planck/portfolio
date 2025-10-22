import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatDate(date: string, locale: string = 'en') {
  // Map our locale codes to full locale identifiers
  const localeMap: Record<string, string> = {
    'en': 'en-US',
    'it': 'it-IT',
    'fr': 'fr-FR'
  };

  return new Date(date).toLocaleDateString(localeMap[locale] || 'en-US', {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}