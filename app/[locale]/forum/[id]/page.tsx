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

export const dynamic = 'force-dynamic';

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
      'SELECT * FROM invitation WHERE id = ?',
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

  return {
    title: `${title} | ${t.forum.title} | ${t.meta.title}`,
    description: abstract || title,
    openGraph: {
      title: `${title} | ${t.forum.title}`,
      description: abstract || title,
      type: "article",
      locale: locale === "en" ? "en_US" : locale === "zh" ? "zh_CN" : "ja_JP",
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

  const backText = locale === "zh" ? "返回列表" : locale === "ja" ? "リストに戻る" : "Back to List";
  const abstractTitle = locale === "zh" ? "报告摘要" : locale === "ja" ? "講演概要" : "Abstract";

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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Link
        href={`/${locale}/forum`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {backText}
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
                {locale === "zh" ? "主讲人：" : locale === "ja" ? "講演者：" : "Speaker: "}
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
                  {locale === "zh" ? "主讲人单位：" : locale === "ja" ? "所属機関：" : "Institution: "}
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
                  {locale === "zh" ? "报告时间：" : locale === "ja" ? "日時：" : "Date: "}
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
          <h2 className="text-2xl font-bold text-foreground">{abstractTitle}</h2>
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
