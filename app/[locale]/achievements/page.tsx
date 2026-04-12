import { content, type Locale, locales } from "@/lib/i18n";
import Link from "next/link";
import { MediaImage } from "@/components/media-image";
import type { Metadata } from "next";
import { query } from "@/lib/db";
import { formatYearMonth } from "@/lib/date-time";

// 启用增量静态再生成，5分钟缓存
export const revalidate = 300;

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = localeParam in content ? localeParam : "en";
  const t = content[locale];

  return {
    title: `${t.navigation.achievements} | ${t.meta.title}`,
    description: `${t.navigation.achievements} - ${t.meta.description}`,
    keywords: [...t.meta.keywords, "news", "media coverage", "research news"],
    alternates: {
      canonical: `/${locale}/achievements`,
      languages: {
        en: "/en/achievements",
        zh: "/zh/achievements",
        ja: "/ja/achievements",
      },
    },
  };
}

interface NewsColumn {
  id: number;
  title_en: string;
  title_zh: string;
  title_ja: string;
  content_en: string | null;
  content_zh: string | null;
  content_ja: string | null;
  journal_name_en: string | null;
  journal_name_zh: string | null;
  journal_name_ja: string | null;
  author_bio_en: string | null;
  author_bio_zh: string | null;
  author_bio_ja: string | null;
  publish_date: string | Date | null;
  series_number: number;
  image: string | null;
  image_en: string | null;
}

async function getNewsColumns(): Promise<NewsColumn[]> {
  try {
    const newsColumns = await query<NewsColumn>(
      `SELECT id, title_en, title_zh, title_ja,
              content_en, content_zh, content_ja,
              journal_name_en, journal_name_zh, journal_name_ja,
              author_bio_en, author_bio_zh, author_bio_ja,
              publish_date, series_number, image, image_en
       FROM news_column
       ORDER BY series_number DESC, id DESC`
    );
    return newsColumns || [];
  } catch (error) {
    console.error('Error fetching news columns:', error);
    return [];
  }
}

function formatPublishDate(dateStr: string | Date | null, locale: string): string {
  return formatYearMonth(dateStr, locale === "en" ? "en" : "zh");
}

export default async function AchievementsPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam in content ? localeParam : "en";
  const t = content[locale];

  const newsColumns = await getNewsColumns();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
      {/* News Column Section */}
      <section className="flex flex-col gap-6">
        {/* Section Title with Primary Color Bar */}
        <div className="flex items-center gap-4">
          <div className="h-8 w-1.5 bg-primary rounded-full" />
          <h2 className="text-2xl font-bold text-foreground sm:text-2xl">
            {t.achievements.mediaReports.title}
          </h2>
        </div>

        {/* News List */}
        <div className="grid gap-6 lg:grid-cols-1">
          {newsColumns.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              {t.achievements.noNewsColumns}
            </p>
          ) : (
            newsColumns.map((item, index) => {
              const title = locale === 'zh' ? item.title_zh : locale === 'ja' ? item.title_ja : item.title_en;
              const content_text = locale === 'zh' ? item.content_zh : locale === 'ja' ? item.content_ja : item.content_en;
              const journalName = locale === 'zh' ? item.journal_name_zh : locale === 'ja' ? item.journal_name_ja : item.journal_name_en;
              const dateDisplay = formatPublishDate(item.publish_date, locale);
              return (
                <article
                  key={item.id}
                  className="group flex flex-col gap-0 overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card hover:shadow-xl hover:shadow-primary/5 sm:flex-row"
                >
                  {/* Image Container */}
                  <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-muted sm:w-64 lg:w-72 sm:aspect-square lg:aspect-[4/3]">
                    <MediaImage
                      src={item.image_en || item.image || ''}
                      alt={title}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 512px, 600px"
                      className="transition-transform duration-500 group-hover:scale-105"
                      priority={index === 0}
                    />
                    <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>

                  {/* Content Area */}
                  <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {journalName && (
                          <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-primary">
                            {journalName}
                          </span>
                        )}
                        {/* Series tag hidden */}
                        {/* <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-primary">
                          {seriesTag}
                        </span> */}
                        {dateDisplay && (
                          <span className="text-[10px] font-medium text-muted-foreground/60">
                            {dateDisplay}
                          </span>
                        )}
                      </div>
                      <Link href={`/${locale}/achievements/${item.id}`}>
                        <h3 className="text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-xl cursor-pointer">
                          {title}
                        </h3>
                      </Link>
                      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground/90 sm:text-base">
                        {content_text}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
                      <Link
                        href={`/${locale}/achievements/${item.id}`}
                        className="flex items-center gap-1 text-[11px] font-semibold text-primary transition-transform duration-300 group-hover:translate-x-1"
                      >
                        <span>{t.achievements.mediaReports.readMore}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
