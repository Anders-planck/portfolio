import type { Metadata } from "next";
import { Antic, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Providers from "@/components/providers";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SystemBanner from "@/components/system-banner";
import { Toaster } from "@/components/ui/sonner";
import { WebsiteStructuredData, PersonStructuredData } from "@/components/structured-data";
import HreflangLinks from "@/components/hreflang-links";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { locales, type Locale } from '@/i18n/config';
import { siteMetadataBase } from '@/lib/site-metadata';
import { generateLocaleStaticParams } from '@/lib/static-params';

import "../globals.css";
import { cn, generateRandomSquares } from "@/lib/utils";
import { GridPattern } from "@/components/ui/grid-pattern";
import { DotPattern } from "@/components/ui/dot-pattern";

const geistSans = Antic({
  variable: "--font-antic",
  subsets: ["latin"],
  weight: ["400"],  
});


const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  metadataBase: siteMetadataBase,
  title: {
    default: 'Anders Planck | Full-Stack Developer & Software Engineer',
    template: '%s | Anders Planck'
  },
  description: 'Anders Planck - Senior Full-Stack Developer con 3+ anni di esperienza in React, Next.js, TypeScript, PHP, Laravel, Symfony. Portfolio progetti, blog tecnico su web development, e CV scaricabile. Ferrara, Italy.',
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

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <HreflangLinks />
        <WebsiteStructuredData />
        <PersonStructuredData />
      </head>
      <body
        className={cn(
          "flex flex-col font-sans antialiased",
          geistSans.variable,
          //signifier.variable,
          jetbrainsMono.variable
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Skip to main content
          </a>
          <Providers>
            <div className="flex min-h-screen flex-col overflow-hidden">
              <SystemBanner dismissible={false} />
              <Header />
              <main id="main-content" className="flex-1 md:px-4 lg:px-0 ">
                {children}
              </main>
              <Footer />
              <Toaster />
              <Analytics />
              <SpeedInsights />
              {/*   <SmoothCursor /> */}
              {/* <RetroGrid /> */}
              {/* <GridPattern
                squares={generateRandomSquares()}
                className={cn(
                  "mask-[radial-gradient(300px_circle_at_center,white,transparent)]",
                  "pointer-events-none skew-y-12 top-0 left-0 right-0 bottom-0 w-screen h-screen fixed -z-10"
                )}
              /> */}

            <DotPattern
                    className={cn(
                      "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
                      "skew-y-12 top-0 left-0 right-0 bottom-0 w-screen h-screen fixed -z-10"
                    )}
                  />
           {/*  <InteractiveGridPattern
              className={cn(
            "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
              "skew-y-12 top-0 left-0 right-0 bottom-0 w-screen h-screen fixed z-0"
            )}
          />  */}
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export const generateStaticParams = generateLocaleStaticParams;
