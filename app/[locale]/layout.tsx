import type { Metadata } from "next";
import { content, publicLocales, type Locale } from "@/lib/i18n";
import { Navbar } from "@/components/navbar";

const ogLocales: Record<Locale, string> = {
  en: "en_US",
  zh: "zh_CN",
  ja: "ja_JP",
};

export function generateStaticParams() {
  return publicLocales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = (localeParam in content ? localeParam : "en") as Locale;
  const t = content[locale];

  return {
    title: t.meta.title,
    description: t.meta.description,
    keywords: [...t.meta.keywords],
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        ja: "/ja",
      },
    },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      type: "profile",
      locale: ogLocales[locale],
    },
    twitter: {
      card: "summary",
      title: t.meta.title,
      description: t.meta.description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = (localeParam in content ? localeParam : "en") as Locale;

  return (
    <>
      <Navbar locale={locale} />
      <div className="pt-20 sm:pt-16">
        {children}
      </div>
    </>
  );
}
