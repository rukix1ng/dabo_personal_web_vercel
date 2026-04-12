import { content, type Locale } from "@/lib/i18n";
import Link from "next/link";
import { ArrowLeft, Calendar, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { ImagePreview } from "@/components/image-preview";
import { formatStructuredDateTime, formatYearMonth } from "@/lib/date-time";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/site-url";

type PageProps = {
  params: Promise<{ locale: Locale; id: string }>;
};

// 启用增量静态再生成，5分钟缓存
export const revalidate = 300;

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
    const rows = await query<NewsColumn>(
      `SELECT id, title_en, title_zh, title_ja,
              content_en, content_zh, content_ja,
              journal_name_en, journal_name_zh, journal_name_ja,
              author_bio_en, author_bio_zh, author_bio_ja,
              publish_date, series_number, image
       FROM news_column
       WHERE id = ?`,
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
  return formatYearMonth(dateStr, locale === "en" ? "en" : "zh");
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
  const journalName = locale === 'zh' ? item.journal_name_zh : locale === 'ja' ? item.journal_name_ja : item.journal_name_en;
  return {
    title: `${title} | ${t.navigation.achievements} | ${t.meta.title}`,
    description: description?.substring(0, 160) || title,
    keywords: [
      ...t.meta.keywords,
      "news",
      "media coverage",
      "research news",
      journalName || "",
    ].filter(Boolean),
    authors: [{ name: journalName || t.meta.title }],
    alternates: {
      canonical: `/${locale}/achievements/${id}`,
      languages: {
        en: `/en/achievements/${id}`,
        zh: `/zh/achievements/${id}`,
        ja: `/ja/achievements/${id}`,
      },
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
  // 生成结构化数据
  const baseUrl = getSiteUrl();

  // BreadcrumbList 结构化数据
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": t.navigation.home || "Home",
        "item": getAbsoluteUrl(`/${locale}`),
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": t.navigation.achievements,
        "item": getAbsoluteUrl(`/${locale}/achievements`),
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": title,
        "item": getAbsoluteUrl(`/${locale}/achievements/${id}`),
      },
    ],
  };

  // NewsArticle 结构化数据
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": title,
    "description": contentText?.substring(0, 200) || title,
    "image": item.image ? [item.image] : undefined,
    "datePublished": formatStructuredDateTime(item.publish_date),
    "author": {
      "@type": "Organization",
      "name": journalName || t.meta.title,
    },
    "publisher": {
      "@type": "Organization",
      "name": t.meta.title,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/icon.png`,
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": getAbsoluteUrl(`/${locale}/achievements/${id}`),
    },
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
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
          {/* Series tag hidden */}
          {/* <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-primary">
            {seriesTag}
          </span> */}
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
          {contentText.split('\n').filter(para => para.trim()).map((paragraph, index) => {
            // 检查是否是小标题（以——开头）
            const isSubtitle = paragraph.trim().startsWith('——');

            if (isSubtitle) {
              // 小标题样式：加粗、左对齐、无缩进
              return (
                <h3 key={index} className="text-base font-bold leading-relaxed text-foreground mt-2">
                  {paragraph}
                </h3>
              );
            }

            // 普通段落：首行缩进
            return (
              <p key={index} className="text-base leading-relaxed text-foreground indent-8">
                {paragraph}
              </p>
            );
          })}
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
