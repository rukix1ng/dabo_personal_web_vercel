import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales, type Locale } from "./lib/i18n";

const PUBLIC_FILE = /\.(.*)$/;

function getBrowserLocale(request: NextRequest): Locale {
  const acceptLanguage = request.headers.get("accept-language");
  if (!acceptLanguage) return defaultLocale;

  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [locale, q = "q=1"] = lang.trim().split(";");
      const quality = parseFloat(q.replace("q=", "")) || 1;
      return { locale: locale.toLowerCase().split("-")[0], quality };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { locale } of languages) {
    if (locale === "zh" || locale === "ja" || locale === "en") {
      return locale as Locale;
    }
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a language path with /admin
  const localeRegex = new RegExp(`^/(${locales.join('|')})/admin`);
  if (localeRegex.test(pathname)) {
    const redirectUrl = new URL('/admin', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect /admin to /admin/invitations
  if (pathname === '/admin') {
    const redirectUrl = new URL('/admin/invitations', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Skip processing for Next.js internals, API routes, public files, and admin routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    PUBLIC_FILE.test(pathname)
  ) {
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return response;
  }

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (!hasLocale) {
    const cookieLocale = request.cookies.get("locale")?.value as Locale | undefined;
    const browserLocale = cookieLocale || getBrowserLocale(request);
    const locale = locales.includes(browserLocale) ? browserLocale : defaultLocale;

    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  const locale = pathname.split("/")[1] ?? defaultLocale;
  const response = NextResponse.next();
  response.cookies.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*|api).*)"],
};
