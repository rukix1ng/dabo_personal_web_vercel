import { content, type Locale, locales } from "@/lib/i18n";
import { PapersPageClient } from "./papers-client";
import { query } from "@/lib/db";
import type { Metadata } from "next";
import { extractYear } from "@/lib/date-time";
import { getAbsoluteUrl } from "@/lib/site-url";

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
    title: `${t.papers.title} | ${t.meta.title}`,
    description: t.papers.description,
    keywords: [...t.meta.keywords, "research papers", "publications", "academic publications"],
    alternates: {
      canonical: `/${locale}/papers`,
      languages: {
        en: "/en/papers",
        zh: "/zh/papers",
        ja: "/ja/papers",
      },
    },
  };
}

interface Paper {
  id: number;
  title_en: string;
  title_zh: string;
  title_ja: string;
  author: string | null;
  journal_name: string | null;
  image: string | null;
  image_en: string | null;
  description_en: string | null;
  description_zh: string | null;
  description_ja: string | null;
  paper_link: string | null;
  sponsor_en: string | null;
  sponsor_zh: string | null;
  sponsor_ja: string | null;
  sponsor_link: string | null;
  created_at: string;
  updated_at: string;
}

interface TransformedPaper {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  journalName: string | null;
  date: string;
  url: string;
  image: string | null;
  imageFallback: string | null;
  description: string | null;
  sponsorLink: string | null;
}

async function getPapers(locale: Locale): Promise<TransformedPaper[]> {
  try {
    const papers = await query<Paper>(
      `SELECT id, title_en, title_zh, title_ja,
              author, journal_name, image, image_en,
              description_en, description_zh, description_ja,
              paper_link, sponsor_en, sponsor_zh, sponsor_ja,
              sponsor_link, created_at, updated_at
       FROM papers
       ORDER BY created_at DESC`
    );

    // Transform database records to Paper format
    return papers.map((paper) => {
      const title = locale === 'zh' ? paper.title_zh : locale === 'ja' ? paper.title_ja : paper.title_en;
      const sponsor = locale === 'zh' ? paper.sponsor_zh : locale === 'ja' ? paper.sponsor_ja : paper.sponsor_en;
      const description = locale === 'zh' ? paper.description_zh : locale === 'ja' ? paper.description_ja : paper.description_en;

      return {
        id: paper.id.toString(),
        title: title,
        authors: paper.author ? [paper.author] : [],
        journal: sponsor || '',
        journalName: paper.journal_name,
        date: extractYear(paper.created_at),
        url: paper.paper_link || '#',
        image: paper.image_en || paper.image,
        imageFallback: paper.image_en ? paper.image : null,
        description: description,
        sponsorLink: paper.sponsor_link,
      };
    });
  } catch (error) {
    console.error('Error fetching papers from database:', error);
    return [];
  }
}

export default async function PapersPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam in content ? localeParam : "en";
  const t = content[locale];

  // Fetch papers from database
  const papers = await getPapers(locale);

  // Generate JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t.papers.title,
    description: t.papers.description,
    url: getAbsoluteUrl(`/${locale}/papers`),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: papers.length,
      itemListElement: papers.slice(0, 10).map((paper, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "ScholarlyArticle",
          headline: paper.title,
          author: paper.authors.map((author) => ({
            "@type": "Person",
            name: author,
          })),
          publisher: {
            "@type": "Organization",
            name: paper.journal,
          },
          datePublished: paper.date,
          url: paper.url,
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PapersPageClient locale={locale} papers={t.papers} mockPapers={papers} />
    </>
  );
}
