import { content, type Locale, locales } from "@/lib/i18n";
import { InvitationCard } from "@/components/invitation-card";
import { FormattedText } from "@/components/formatted-text";
import type { Metadata } from "next";
import { query } from "@/lib/db";
import { formatStructuredDateTime } from "@/lib/date-time";

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
    title: `${t.forum.title} | ${t.meta.title}`,
    description: `${t.forum.title} - ${t.meta.description}`,
    keywords: [...t.meta.keywords, "forum", "academic forum", "research forum", "NIMS", "LAM"],
    alternates: {
      canonical: `/${locale}/forum`,
      languages: {
        en: "/en/forum",
        zh: "/zh/forum",
        ja: "/ja/forum",
      },
    },
  };
}

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
  sort_order: number;
  created_at: string;
  updated_at: string;
}

async function getInvitations(): Promise<Invitation[]> {
  try {
    const invitations = await query<Invitation>(
      `SELECT id, title_en, subtitle_en, speaker_en, speaker_institution_en, abstract_en,
              title_zh, subtitle_zh, speaker_zh, speaker_institution_zh, abstract_zh,
              title_ja, subtitle_ja, speaker_ja, speaker_institution_ja, speaker_institution_link, abstract_ja,
              event_time, image, video_link
       FROM invitation
       ORDER BY event_time DESC, id DESC`
    );
    return invitations || [];
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return [];
  }
}

export default async function ForumPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam in content ? localeParam : "en";
  const t = content[locale];

  const invitations = await getInvitations();

  // Generate JSON-LD structured data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t.forum.title,
    description: `${t.forum.title} - ${t.meta.description}`,
    url: `${baseUrl}/${locale}/forum`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: invitations.length,
      itemListElement: invitations.map((invitation, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Event",
          name: locale === 'zh' ? invitation.title_zh : locale === 'ja' ? invitation.title_ja : invitation.title_en,
          description: locale === 'zh' ? invitation.abstract_zh : locale === 'ja' ? invitation.abstract_ja : invitation.abstract_en,
          startDate: formatStructuredDateTime(invitation.event_time),
          performer: {
            "@type": "Person",
            name: locale === 'zh' ? invitation.speaker_zh : locale === 'ja' ? invitation.speaker_ja : invitation.speaker_en,
          },
          url: `${baseUrl}/${locale}/forum/${invitation.id}`,
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
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-12 px-4 py-10 sm:px-6 lg:px-8">
        {/* Inviter Introduction Section */}
        <section id="inviter-intro" className="flex flex-col overflow-hidden rounded-xl bg-card shadow-md">
          <div className="h-1.5 bg-primary"></div>
          <div className="flex flex-col gap-6 py-8 px-4 sm:py-10 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-foreground sm:text-2xl">
              {t.forum.inviterIntro.title}
            </h1>
            <div className="flex flex-col gap-4">
              <div className="text-base leading-relaxed text-foreground sm:text-lg">
                <FormattedText text={t.forum.inviterIntro.content} />
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Invited Talks Section */}
        <section id="invited-talks" className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1.5 bg-primary rounded-full" />
            <h2 className="text-2xl font-bold text-foreground sm:text-2xl">
              {t.forum.title}
            </h2>
          </div>

          {/* Invitation Cards List */}
          <div className="flex flex-col gap-6">
            {invitations.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                {t.forum.noInvitations}
              </p>
            ) : (
              invitations.map((invitation, index) => (
                <InvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  locale={locale}
                  priority={index === 0}
                />
              ))
            )}
          </div>
        </section>
      </main>
    </>
  );
}
