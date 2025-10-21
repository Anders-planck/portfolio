import type { Metadata } from "next";
import { Merriweather, Oxanium } from "next/font/google";
import Providers from "@/components/providers";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SystemBanner from "@/components/system-banner";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";
import { cn } from "@/lib/utils";

const geistSans = Oxanium({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Merriweather({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://anders-games.com'),
  title: {
    default: 'Anders Planck | Full-Stack Developer & Software Engineer',
    template: '%s | Anders Planck'
  },
  description: 'Full-stack developer specializing in React, Next.js, TypeScript, and modern web technologies. Explore my portfolio, blog posts, and open-source projects.',
  keywords: [
    'Anders Planck',
    'Full-Stack Developer',
    'Software Engineer',
    'React Developer',
    'Next.js',
    'TypeScript',
    'JavaScript',
    'Web Development',
    'Frontend Development',
    'Backend Development',
    'Portfolio',
    'Blog',
    'Open Source'
  ],
  authors: [{ name: 'Anders Planck' }],
  creator: 'Anders Planck',
  publisher: 'Anders Planck',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://anders-games.com',
    title: 'Anders Planck | Full-Stack Developer & Software Engineer',
    description: 'Full-stack developer specializing in React, Next.js, TypeScript, and modern web technologies.',
    siteName: 'Anders Planck Portfolio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Anders Planck - Full-Stack Developer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anders Planck | Full-Stack Developer & Software Engineer',
    description: 'Full-stack developer specializing in React, Next.js, TypeScript, and modern web technologies.',
    creator: '@andersplanck',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/Favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/Favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/Favicon/favicon.ico',
    apple: [
      { url: '/Favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        url: '/Favicon/android-chrome-192x192.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '512x512',
        url: '/Favicon/android-chrome-512x512.png',
      },
    ],
  },
  manifest: '/Favicon/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "flex flex-col font-sans antialiased",
          geistSans.variable,
          geistMono.variable
        )}
      >
        <Providers>
          <SystemBanner />
          <Header />
          <main className="grow">
            {children}
          </main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
