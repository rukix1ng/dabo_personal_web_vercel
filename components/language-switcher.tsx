"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Globe } from "lucide-react";
import { localeLabels, publicLocales, type Locale } from "@/lib/i18n";

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const currentPath = pathname.replace(/^\/[^/]+/, "");

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted/50 cursor-pointer"
        aria-label="Switch language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="hidden sm:inline">{localeLabels[currentLocale]}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-36 overflow-hidden rounded-lg border border-border/50 bg-card shadow-xl backdrop-blur-sm">
          <div className="p-1.5">
            {publicLocales.map((locale) => {
              const newHref = `/${locale}${currentPath}`;
              const isActive = locale === currentLocale;
              return (
                <Link
                  key={locale}
                  href={newHref}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-200 ${isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted/50"
                    }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span>{localeLabels[locale]}</span>
                  {isActive && (
                    <span className="ml-auto text-xs text-primary">✓</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
