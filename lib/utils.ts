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


function seededRandom(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}

export function generateRandomSquares(
  count = 20,
  maxX = 20,
  maxY = 20,
  seed = 42
) {
  const used = new Set<string>()
  const squares: Array<[number, number]> = []
  const random = seededRandom(seed)

  while (squares.length < count) {
    const x = Math.floor(random() * maxX)
    const y = Math.floor(random() * maxY)
    const key = `${x}-${y}`
    if (used.has(key)) continue
    used.add(key)
    squares.push([x, y])
  }

  return squares
}