import { content, type Locale, publicLocales } from "@/lib/i18n";
import { FormattedText } from "@/components/formatted-text";
import { ProjectNews } from "@/components/project-news";
import { query } from "@/lib/db";
import type { Metadata } from "next";
import { extractDateTimeParts } from "@/lib/date-time";
import { resolveNewsHref } from "@/lib/news-links";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return publicLocales.map((locale) => ({ locale }));
}

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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
  };
}

type NewsRecord = {
  id: number;
  title_en: string;
  title_zh: string;
  title_ja: string;
  link_type: string;
  link_value: string | null;
  news_date: string | Date | null;
  image: string | null;
  show_in_featured: boolean;
};

type HomepageFeaturedItem = {
  id: string;
  title: string;
  date: string;
  image: string;
  href?: string;
  external?: boolean;
};

type HomepageListItem = {
  id: string;
  title: string;
  date: string;
  href?: string;
  external?: boolean;
};

const HOMEPAGE_NEWS_PAGE_SIZE = 10;

function pickLocalizedTitle(
  locale: Locale,
  record: {
    title_en: string;
    title_zh: string;
    title_ja: string;
  }
) {
  if (locale === "zh") return record.title_zh;
  if (locale === "ja") return record.title_ja;
  return record.title_en;
}

function formatDateValue(value: string | Date | null) {
  if (!value) return "";
  const parts = extractDateTimeParts(value);
  if (!parts) return "";

  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  return `${parts.year}-${month}-${day}`;
}

async function getHomepageProjectNews(locale: Locale): Promise<{
  featured: HomepageFeaturedItem[];
  list: HomepageListItem[];
  listTotalCount: number;
}> {
  try {
    const tableRows = await query<{ table_name: string }>(
      `SELECT TABLE_NAME AS table_name
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'news'
       LIMIT 1`
    );

    if (tableRows.length === 0) {
      return { featured: [], list: [], listTotalCount: 0 };
    }

    const [featuredRows, listRows, listCountRows] = await Promise.all([
      query<NewsRecord>(
        `SELECT id, title_en, title_zh, title_ja, link_type, link_value, news_date, image, show_in_featured
         FROM news
         WHERE show_in_featured = TRUE
         ORDER BY news_date DESC, id DESC
         LIMIT 3`
      ),
      query<NewsRecord>(
        `SELECT id, title_en, title_zh, title_ja, link_type, link_value, news_date, image, show_in_featured
         FROM news
         WHERE show_in_featured = FALSE
         ORDER BY news_date DESC, id DESC
         LIMIT ?`,
        [HOMEPAGE_NEWS_PAGE_SIZE]
      ),
      query<{ count: number }>(
        `SELECT COUNT(*) AS count
         FROM news
         WHERE show_in_featured = FALSE`
      ),
    ]);

    const featured = featuredRows.map((item) => ({
      id: `news-${item.id}`,
      title: pickLocalizedTitle(locale, item),
      date: formatDateValue(item.news_date),
      image: item.image || "",
      ...resolveNewsHref(locale, item.link_type, item.link_value),
    }));

    const list = listRows.map((item) => ({
      id: `news-${item.id}`,
      title: pickLocalizedTitle(locale, item),
      date: formatDateValue(item.news_date),
      ...resolveNewsHref(locale, item.link_type, item.link_value),
    }));

    return {
      featured,
      list,
      listTotalCount: Number(listCountRows[0]?.count ?? 0),
    };
  } catch (error) {
    console.error("Error fetching homepage project news:", error);
    return { featured: [], list: [], listTotalCount: 0 };
  }
}

export default async function LocaleHome({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = (localeParam in content ? localeParam : "en") as Locale;
  const t = content[locale];
  const projectNews = await getHomepageProjectNews(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Project",
    name: t.hero.name,
    alternateName: t.hero.title,
    description: t.hero.description,
    keywords: t.meta.keywords.join(", "),
    areaServed: "Japan",
    knowsAbout: t.info.fields,
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
      <section id="industry-intro" className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <div className="h-8 w-1.5 rounded-full bg-primary" />
          <h2 className="text-2xl font-bold text-foreground sm:text-2xl">
            {t.sections.industryIntro.title}
          </h2>
        </div>
        <div className="text-base leading-relaxed text-foreground sm:text-lg">
          <FormattedText text={t.sections.industryIntro.content} />
        </div>
      </section>

      <div className="border-t border-border" />

      <section id="project-news" className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <div className="h-8 w-1.5 rounded-full bg-primary" />
          <h2 className="text-2xl font-bold text-foreground sm:text-2xl">
            {t.sections.projectNews.title}
          </h2>
        </div>
        <ProjectNews
          locale={locale}
          featured={projectNews.featured}
          list={projectNews.list}
          totalListItems={projectNews.listTotalCount}
          pageSize={HOMEPAGE_NEWS_PAGE_SIZE}
        />
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
