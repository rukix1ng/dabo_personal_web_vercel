import { content, type Locale, locales } from "@/lib/i18n";
import Link from "next/link";
import { Calendar, User, Building2, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { BilibiliPlayer } from "@/components/bilibili-player";

type PageProps = {
  params: Promise<{ locale: Locale; id: string }>;
};

// 启用增量静态再生成，5分钟缓存
export const revalidate = 300;

interface Invitation {
  id: number;
  title_en: string;
  subtitle_en: string | null;
  speaker_en: string;
  speaker_institution_en: string | null;
  abstract_en: string | null;
  title_zh: string;
  subtitle_zh: string | null;
  speaker_zh: string;
  speaker_institution_zh: string | null;
  abstract_zh: string | null;
  title_ja: string;
  subtitle_ja: string | null;
  speaker_ja: string;
  speaker_institution_ja: string | null;
  speaker_institution_link: string | null;
  abstract_ja: string | null;
  event_time: string | null;
  image: string | null;
  video_link: string | null;
}

async function getInvitation(id: string): Promise<Invitation | null> {
  try {
    const invitations = await query<any>(
      `SELECT id, title_en, subtitle_en, speaker_en, speaker_institution_en, abstract_en,
              title_zh, subtitle_zh, speaker_zh, speaker_institution_zh, abstract_zh,
              title_ja, subtitle_ja, speaker_ja, speaker_institution_ja, speaker_institution_link, abstract_ja,
              event_time, image, video_link
       FROM invitation
       WHERE id = ?`,
      [parseInt(id)]
    );

    if (invitations.length === 0) {
      return null;
    }

    return invitations[0];
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam, id } = await params;
  const locale = localeParam in content ? localeParam : "en";
  const t = content[locale];

  const invitation = await getInvitation(id);
  if (!invitation) {
    return {
      title: `${t.forum.title} | ${t.meta.title}`,
    };
  }

  const title = locale === "zh" ? invitation.title_zh : locale === "ja" ? invitation.title_ja : invitation.title_en;
  const abstract = locale === "zh" ? invitation.abstract_zh : locale === "ja" ? invitation.abstract_ja : invitation.abstract_en;
  const speaker = locale === "zh" ? invitation.speaker_zh : locale === "ja" ? invitation.speaker_ja : invitation.speaker_en;
  const institution = locale === "zh" ? invitation.speaker_institution_zh : locale === "ja" ? invitation.speaker_institution_ja : invitation.speaker_institution_en;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return {
    title: `${title} | ${t.forum.title} | ${t.meta.title}`,
    description: abstract || title,
    keywords: [
      ...t.meta.keywords,
      "academic lecture",
      "seminar",
      "research talk",
      speaker,
      institution || "",
    ].filter(Boolean),
    authors: [{ name: speaker }],
    alternates: {
      canonical: `/${locale}/forum/${id}`,
      languages: {
        en: `/en/forum/${id}`,
        zh: `/zh/forum/${id}`,
        ja: `/ja/forum/${id}`,
      },
    },
    openGraph: {
      title: `${title} | ${t.forum.title}`,
      description: abstract || title,
      type: "article",
      locale: locale === "en" ? "en_US" : locale === "zh" ? "zh_CN" : "ja_JP",
      url: `${baseUrl}/${locale}/forum/${id}`,
      siteName: t.meta.title,
      images: invitation.image
        ? [
            {
              url: invitation.image,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
      article: {
        publishedTime: invitation.event_time ? new Date(invitation.event_time).toISOString() : undefined,
        authors: [speaker],
        section: t.forum.title,
        tags: ["lecture", "seminar", "academic"],
      },
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${t.forum.title}`,
      description: abstract || title,
      images: invitation.image ? [invitation.image] : undefined,
    },
  };
}

export default async function InvitationDetailPage({ params }: PageProps) {
  const { locale: localeParam, id } = await params;
  const locale = localeParam in content ? localeParam : "en";
  const t = content[locale];

  const invitation = await getInvitation(id);

  if (!invitation) {
    notFound();
  }

  const title = locale === "zh" ? invitation.title_zh : locale === "ja" ? invitation.title_ja : invitation.title_en;
  const subtitle = locale === "zh" ? invitation.subtitle_zh : locale === "ja" ? invitation.subtitle_ja : invitation.subtitle_en;
  const speaker = locale === "zh" ? invitation.speaker_zh : locale === "ja" ? invitation.speaker_ja : invitation.speaker_en;
  const institution = locale === "zh" ? invitation.speaker_institution_zh : locale === "ja" ? invitation.speaker_institution_ja : invitation.speaker_institution_en;
  const abstract = locale === "zh" ? invitation.abstract_zh : locale === "ja" ? invitation.abstract_ja : invitation.abstract_en;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (locale === "zh") {
      return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (locale === "ja") {
      return date.toLocaleString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  // 生成结构化数据
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // BreadcrumbList 结构化数据
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": t.navigation.home || "Home",
        "item": `${baseUrl}/${locale}`,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": t.forum.title,
        "item": `${baseUrl}/${locale}/forum`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": title,
        "item": `${baseUrl}/${locale}/forum/${id}`,
      },
    ],
  };

  // Event 结构化数据
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": title,
    "description": abstract || title,
    "startDate": invitation.event_time ? new Date(invitation.event_time).toISOString() : undefined,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
    "location": {
      "@type": "VirtualLocation",
      "url": `${baseUrl}/${locale}/forum/${id}`,
    },
    "image": invitation.image ? [invitation.image] : undefined,
    "performer": {
      "@type": "Person",
      "name": speaker,
      "affiliation": institution
        ? {
            "@type": "Organization",
            "name": institution,
            "url": invitation.speaker_institution_link || undefined,
          }
        : undefined,
    },
    "organizer": {
      "@type": "Organization",
      "name": t.meta.title,
      "url": baseUrl,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      {/* Back Button */}
      <Link
        href={`/${locale}/forum`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.common.backToList}
      </Link>

      {/* Title and Meta Information */}
      <div className="flex flex-col gap-4">
        {/* Title Section */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Meta Information */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 border-l-2 border-primary pl-4">
          {/* Speaker */}
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <span className="text-foreground">
              <span className="font-medium">
                {t.common.speakerLabel}
              </span>
              {speaker}
            </span>
          </div>

          {/* Institution */}
          {institution && (
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-foreground">
                <span className="font-medium">
                  {t.common.institutionLabel}
                </span>
                {invitation.speaker_institution_link ? (
                  <a
                    href={invitation.speaker_institution_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:text-primary/80 transition-colors"
                  >
                    {institution}
                  </a>
                ) : (
                  institution
                )}
              </span>
            </div>
          )}

          {/* Date */}
          {invitation.event_time && (
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-foreground">
                <span className="font-medium">
                  {t.common.dateLabel}
                </span>
                {formatDate(invitation.event_time)}
              </span>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Bilibili Video Player */}
      {invitation.video_link && (
        <div className="w-full">
          <BilibiliPlayer bvid={invitation.video_link} title={title} />
        </div>
      )}

      {/* Abstract */}
      {abstract && (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-foreground">{t.common.abstract}</h2>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {abstract.split('\n').filter(para => para.trim()).map((paragraph, index) => (
              <p key={index} className="text-base leading-relaxed text-foreground indent-8 mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
