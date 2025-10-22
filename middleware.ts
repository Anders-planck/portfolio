import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { locales, defaultLocale, Locale } from './i18n/config';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always use locale prefix in the URL
  localePrefix: 'always',

  // Custom locale detection: check cookie first, then Accept-Language header
  localeDetection: true
});

export default function middleware(request: NextRequest) {
  // Check for saved locale preference in cookie
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;

  // If cookie exists and is valid, use it for locale detection
  if (localeCookie && locales.includes(localeCookie as Locale)) {
    // Create a new headers object with the preferred locale
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('accept-language', localeCookie);

    return intlMiddleware(
      new NextRequest(request.url, {
        headers: requestHeaders,
      })
    );
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
