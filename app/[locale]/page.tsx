import { content, type Locale, locales } from "@/lib/i18n";
import { FormattedText } from "@/components/formatted-text";
import { ProjectNews } from "@/components/project-news";
import { query } from "@/lib/db";
import type { Metadata } from "next";
import { formatMonthInputValue } from "@/lib/date-time";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
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
        zh: "/zh",
        ja: "/ja",
      },
    },
  };
}

type InvitationRecord = {
  id: number;
  title_en: string;
  title_zh: string;
  title_ja: string;
  display_title_en: string | null;
  display_title_zh: string | null;
  display_title_ja: string | null;
  image: string | null;
  poster: string | null;
  event_time: string | null;
};

type NewsColumnRecord = {
  id: number;
  title_en: string;
  title_zh: string;
  title_ja: string;
  display_title_en: string | null;
  display_title_zh: string | null;
  display_title_ja: string | null;
  image: string | null;
  publish_date: string | Date | null;
};

type PaperRecord = {
  id: number;
  title_en: string;
  title_zh: string;
  title_ja: string;
  display_title_en: string | null;
  display_title_zh: string | null;
  display_title_ja: string | null;
  image: string | null;
  created_at: string;
  paper_link: string | null;
};

type HomepageFeaturedItem = {
  id: string;
  title: string;
  date: string;
  image: string;
  href: string;
  external?: boolean;
};

type HomepageListItem = {
  id: string;
  title: string;
  date: string;
  href: string;
  external?: boolean;
};

function pickLocalizedTitle(
  locale: Locale,
  record: {
    title_en: string;
    title_zh: string;
    title_ja: string;
    display_title_en?: string | null;
    display_title_zh?: string | null;
    display_title_ja?: string | null;
  }
) {
  // 优先使用 display_title，如果为空则使用原 title
  if (locale === "zh") return record.display_title_zh || record.title_zh;
  if (locale === "ja") return record.display_title_ja || record.title_ja;
  return record.display_title_en || record.title_en;
}

function formatDateValue(value: string | Date | null) {
  if (!value) return "";
  return formatMonthInputValue(value);
}

async function getHomepageProjectNews(locale: Locale): Promise<{
  featured: HomepageFeaturedItem[];
  list: HomepageListItem[];
}> {
  try {
    const [invitations, newsColumns, papers] = await Promise.all([
      query<InvitationRecord>(
        `SELECT id, title_en, title_zh, title_ja, display_title_en, display_title_zh, display_title_ja, image, poster, event_time
         FROM invitation
         ORDER BY event_time DESC, id DESC
         LIMIT 3`
      ),
      query<NewsColumnRecord>(
        `SELECT id, title_en, title_zh, title_ja, display_title_en, display_title_zh, display_title_ja, image, publish_date
         FROM news_column
         ORDER BY series_number DESC, id DESC
         LIMIT 3`
      ),
      query<PaperRecord>(
        `SELECT id, title_en, title_zh, title_ja, display_title_en, display_title_zh, display_title_ja, image, created_at, paper_link
         FROM papers
         ORDER BY created_at DESC, id DESC
         LIMIT 3`
      ),
    ]);

    const featured: HomepageFeaturedItem[] = [];
    const list: HomepageListItem[] = [];

    const pushGroupItems = <
      T extends { id: number; title_en: string; title_zh: string; title_ja: string }
    >(
      prefix: "invitation" | "news-column" | "paper",
      rows: T[],
      getDate: (row: T) => string,
      getImage: (row: T) => string,
      getHref: (row: T) => string,
      isExternal?: (row: T) => boolean
    ) => {
      const [latest, ...rest] = rows;
      if (latest) {
        featured.push({
          id: `${prefix}-${latest.id}`,
          title: pickLocalizedTitle(locale, latest),
          date: getDate(latest),
          image: getImage(latest),
          href: getHref(latest),
          external: isExternal?.(latest) ?? false,
        });
      }

      for (const item of rest.slice(0, 2)) {
        list.push({
          id: `${prefix}-${item.id}`,
          title: pickLocalizedTitle(locale, item),
          date: getDate(item),
          href: getHref(item),
          external: isExternal?.(item) ?? false,
        });
      }
    };

    pushGroupItems(
      "invitation",
      invitations,
      (row) => formatDateValue(row.event_time),
      (row) => row.poster || row.image || "",
      (row) => `/${locale}/forum/${row.id}`
    );
    pushGroupItems(
      "news-column",
      newsColumns,
      (row) => formatDateValue(row.publish_date),
      (row) => row.image || "",
      (row) => `/${locale}/achievements/${row.id}`
    );
    pushGroupItems(
      "paper",
      papers,
      (row) => formatDateValue(row.created_at),
      (row) => row.image || "",
      (row) => row.paper_link || `/${locale}/papers`,
      (row) => Boolean(row.paper_link && row.paper_link !== "#")
    );

    return { featured, list };
  } catch (error) {
    console.error("Error fetching homepage project news:", error);
    return { featured: [], list: [] };
  }
}


export default async function LocaleHome({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = (localeParam in content ? localeParam : "en") as Locale;
  const t = content[locale];
  const projectNews = await getHomepageProjectNews(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: t.hero.name,
    jobTitle: t.hero.title,
    email: `mailto:${t.info.email}`,
    telephone: t.info.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: t.info.address,
    },
    knowsAbout: t.info.fields,
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Introduction Section */}
      <section id="industry-intro" className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <div className="h-8 w-1.5 bg-primary rounded-full" />
          <h2 className="text-2xl font-bold text-foreground sm:text-2xl">
            {t.sections.industryIntro.title}
          </h2>
        </div>
        <div className="text-base leading-relaxed text-foreground sm:text-lg">
          <FormattedText text={t.sections.industryIntro.content} />
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Project News Section */}
      <section id="project-news" className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <div className="h-8 w-1.5 bg-primary rounded-full" />
          <h2 className="text-2xl font-bold text-foreground sm:text-2xl">
            {t.sections.projectNews.title}
          </h2>
        </div>
        <ProjectNews locale={locale} featured={projectNews.featured} list={projectNews.list} />
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
