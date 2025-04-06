import { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

// Create the middleware with next-intl
const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,
  
  // Used when no locale matches
  defaultLocale,
  
  // Locales are matched in the order they are defined
  localePrefix: 'always',
  
  // Enable locale detection for better user experience
  localeDetection: true
});

// Export a middleware function that wraps the intl middleware
export default function middleware(request: NextRequest) {
  // Forward to the intl middleware
  return intlMiddleware(request);
}

export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
