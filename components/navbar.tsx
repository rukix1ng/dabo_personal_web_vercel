"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { content, type Locale } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";

interface NavbarProps {
  locale: Locale;
}

export function Navbar({ locale }: NavbarProps) {
  const pathname = usePathname();
  const t = content[locale];

  const navItems = [
    { key: "home", href: `/${locale}` },
    { key: "forum", href: `/${locale}/forum` },
    { key: "achievements", href: `/${locale}/achievements` },
    { key: "papers", href: `/${locale}/papers` },
  ] as const;

  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      // For home page, match exactly or with trailing slash
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-border/50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo/Brand */}
        <div className="min-w-0 flex-1 sm:flex-none">
          <Link
            href={`/${locale}`}
            className="group flex min-w-0 items-center gap-2.5 text-foreground transition-colors hover:text-primary sm:gap-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-105 sm:h-10 sm:w-10">
              <Image
                src="/icon.png"
                alt={t.hero.name}
                width={36}
                height={36}
                className="h-8 w-8 rounded-full object-cover sm:h-9 sm:w-9"
                priority
              />
            </span>
            <span className="line-clamp-2 text-sm font-bold leading-tight tracking-tight sm:text-lg lg:text-xl">
              {t.hero.name}
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="hidden items-center gap-0.5 sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${isActive(item.href)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              {t.navigation[item.key]}
              {isActive(item.href) && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher currentLocale={locale} />
      </div>

      {/* Mobile Navigation */}
      <div className="border-t border-border/50 bg-background/80 px-4 py-3 sm:hidden">
        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${isActive(item.href)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
            >
              {t.navigation[item.key]}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
