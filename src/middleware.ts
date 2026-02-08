import {NextResponse, type NextRequest} from 'next/server';
import createMiddleware from 'next-intl/middleware';

import {routing} from './i18n/routing';

const intlMiddleware = createMiddleware(routing);
const adminPathRegex = /^\/(?:(fa|ar|en)\/)?admin(?:\/|$)/;
const adminAuthPathRegex =
  /^\/(?:(fa|ar|en)\/)?admin\/(?:login|reset-password)(?:\/|$)/;

const isAdminPath = (pathname: string) => adminPathRegex.test(pathname);
const isAdminAuthPath = (pathname: string) => adminAuthPathRegex.test(pathname);

const hasAdminAccess = (request: NextRequest) => {
  const authToken =
    request.cookies.get('auth-token')?.value ||
    request.cookies.get('session')?.value;
  const role =
    request.cookies.get('role')?.value ||
    request.cookies.get('user-role')?.value;

  return Boolean(authToken) && role === 'admin';
};

export default function middleware(request: NextRequest) {
  if (
    isAdminPath(request.nextUrl.pathname) &&
    !isAdminAuthPath(request.nextUrl.pathname) &&
    !hasAdminAccess(request)
  ) {
    const localeMatch = request.nextUrl.pathname.match(/^\/(fa|ar|en)(?:\/|$)/);
    const locale = localeMatch?.[1] ?? routing.defaultLocale;
    const loginUrl = new URL(`/${locale}/admin/login`, request.url);

    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
