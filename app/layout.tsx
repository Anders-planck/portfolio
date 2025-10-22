import type { ReactNode } from 'react';
import { locales } from '@/i18n/config';

type Props = {
  children: ReactNode;
};

// Since we have a `[locale]` segment, this layout is required
// to simply pass children through. The actual layout logic is in [locale]/layout.tsx
export default function RootLayout({ children }: Props) {
  return children;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
