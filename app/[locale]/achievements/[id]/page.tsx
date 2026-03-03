import { content, type Locale, locales } from "@/lib/i18n";
import Link from "next/link";
import { ArrowLeft, Calendar, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { ImagePreview } from "@/components/image-preview";

type PageProps = {
  params: Promise<{ locale: Locale; id: string }>;
};

export const dynamic = 'force-dynamic';

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
}

async function getNewsColumn(id: string): Promise<NewsColumn | null> {
  try {
    const rows = await query<any>(
      'SELECT * FROM news_column WHERE id = ?',
      [parseInt(id)]
    );
    if (rows.length === 0) return null;
    return rows[0];
  } catch (error) {
    console.error('Error fetching news column:', error);
    return null;
  }
}

function formatPublishDate(dateStr: string | Date | null, locale: string): string {
  if (!dateStr) return "";
  let year: number, month: number;
  if (dateStr instanceof Date) {
    year = dateStr.getFullYear();
    month = dateStr.getMonth() + 1;
  } else {
    const s = String(dateStr).includes('T') ? String(dateStr).substring(0, 10) : String(dateStr);
    const parts = s.split('-');
    if (!parts[0] || !parts[1]) return "";
    year = parseInt(parts[0]);
    month = parseInt(parts[1]);
  }
  if (locale === 'en') {
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return `${monthNames[month - 1]} ${year}`;
  }
  return `${year}年${month}月`;
}

function formatSeriesTag(seriesNumber: number, locale: string): string {
  if (locale === 'en') return `No. ${seriesNumber}`;
  if (locale === 'ja') return `第 ${seriesNumber} 号`;
  return `第 ${seriesNumber} 期`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam, id } = await params;
  const locale = localeParam in content ? localeParam : "en";
  const t = content[locale];

  const item = await getNewsColumn(id);
  if (!item) {
    return { title: `${t.navigation.achievements} | ${t.meta.title}` };
  }

  const title = locale === 'zh' ? item.title_zh : locale === 'ja' ? item.title_ja : item.title_en;
  const description = locale === 'zh' ? item.content_zh : locale === 'ja' ? item.content_ja : item.content_en;

  return {
    title: `${title} | ${t.navigation.achievements} | ${t.meta.title}`,
    description: description?.substring(0, 160) || title,
    openGraph: {
      title: `${title} | ${t.navigation.achievements}`,
      description: description?.substring(0, 160) || title,
      type: "article",
      locale: locale === "en" ? "en_US" : locale === "zh" ? "zh_CN" : "ja_JP",
      images: item.image ? [item.image] : undefined,
    },
  };
}

export default async function NewsColumnDetailPage({ params }: PageProps) {
  const { locale: localeParam, id } = await params;
  const locale = localeParam in content ? localeParam : "en";
  const t = content[locale];

  const item = await getNewsColumn(id);
  if (!item) notFound();

  const title = locale === 'zh' ? item.title_zh : locale === 'ja' ? item.title_ja : item.title_en;
  const contentText = locale === 'zh' ? item.content_zh : locale === 'ja' ? item.content_ja : item.content_en;
  const journalName = locale === 'zh' ? item.journal_name_zh : locale === 'ja' ? item.journal_name_ja : item.journal_name_en;
  const authorBio = locale === 'zh' ? item.author_bio_zh : locale === 'ja' ? item.author_bio_ja : item.author_bio_en;
  const dateDisplay = formatPublishDate(item.publish_date, locale);
  const seriesTag = formatSeriesTag(item.series_number, locale);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Link
        href={`/${locale}/achievements`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.common.backToList}
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-6">
        {/* Badges & Meta */}
        <div className="flex items-center gap-2 flex-wrap">
          {journalName && (
            <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-primary">
              {journalName}
            </span>
          )}
          <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-primary">
            {seriesTag}
          </span>
          {dateDisplay && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{dateDisplay}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold leading-snug text-foreground sm:text-3xl">
          {title}
        </h1>
      </div>

      {/* Image */}
      {item.image && (
        <ImagePreview
          src={item.image}
          alt={title}
          className="w-full h-auto rounded-lg"
        />
      )}

      {/* Content */}
      {contentText && (
        <div className="flex flex-col gap-4">
          {contentText.split('\n').filter(para => para.trim()).map((paragraph, index) => (
            <p key={index} className="text-base leading-relaxed text-foreground indent-8">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {/* Author Bio */}
      {authorBio && (
        <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/30 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BookOpen className="h-4 w-4 text-primary" />
            {t.common.authorBio}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {authorBio}
          </p>
        </div>
      )}
    </main>
  );
}
