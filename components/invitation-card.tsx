"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, User, Building2 } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { formatLocalDateTime } from "@/lib/date-time";
import { getInvitationImageUrl } from "@/lib/invitation-assets";

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
  image_en: string | null;
  video_link: string | null;
}

interface InvitationCardProps {
  invitation: Invitation;
  locale: Locale;
  priority?: boolean;
}

export function InvitationCard({ invitation, locale, priority = false }: InvitationCardProps) {
  const title = locale === "zh" ? invitation.title_zh : locale === "ja" ? invitation.title_ja : invitation.title_en;
  const subtitle = locale === "zh" ? invitation.subtitle_zh : locale === "ja" ? invitation.subtitle_ja : invitation.subtitle_en;
  const speaker = locale === "zh" ? invitation.speaker_zh : locale === "ja" ? invitation.speaker_ja : invitation.speaker_en;
  const institution = locale === "zh" ? invitation.speaker_institution_zh : locale === "ja" ? invitation.speaker_institution_ja : invitation.speaker_institution_en;
  const abstract = locale === "zh" ? invitation.abstract_zh : locale === "ja" ? invitation.abstract_ja : invitation.abstract_en;
  const imageUrl = getInvitationImageUrl(invitation);

  const viewMoreText = locale === "zh" ? "查看更多" : locale === "ja" ? "詳細を見る" : "View More";
  const speakerLabel = locale === "zh" ? "主讲人：" : locale === "ja" ? "講演者：" : "Speaker: ";
  const institutionLabel = locale === "zh" ? "主讲人单位：" : locale === "ja" ? "所属機関：" : "Institution: ";
  const dateLabel = locale === "zh" ? "报告时间：" : locale === "ja" ? "日時：" : "Date: ";
  const abstractLabel = locale === "zh" ? "摘要：" : locale === "ja" ? "概要：" : "Abstract: ";

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return formatLocalDateTime(dateString, locale);
  };

  return (
    <div className="group rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-lg">
      <div className="flex flex-col md:flex-row gap-6 p-6">
        {/* Content */}
        <div className="flex flex-1 flex-col gap-3">
          {/* Title */}
          <div>
            <Link href={`/${locale}/forum/${invitation.id}`}>
              <h3 className="text-xl font-bold text-foreground transition-colors group-hover:text-primary cursor-pointer">
                {title}
              </h3>
            </Link>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {/* Meta Information */}
          <div className="flex flex-col gap-2 text-sm">
            {/* Speaker */}
            <div className="flex items-start gap-2 text-muted-foreground">
              <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                <span className="font-medium">{speakerLabel}</span>
                {speaker}
              </span>
            </div>

            {/* Institution */}
            {institution && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <span className="font-medium">{institutionLabel}</span>
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
              <div className="flex items-start gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <span className="font-medium">{dateLabel}</span>
                  {formatDate(invitation.event_time)}
                </span>
              </div>
            )}
          </div>

          {/* Abstract */}
          {abstract && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{abstractLabel}</span>
              <span className="line-clamp-3 leading-relaxed">{abstract}</span>
            </div>
          )}

          {/* View More Link */}
          <div className="mt-auto pt-2">
            <Link
              href={`/${locale}/forum/${invitation.id}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              {viewMoreText}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        {/* Image */}
        {imageUrl && (
          <div className="relative w-full md:w-48 h-48 md:h-auto md:self-stretch flex-shrink-0 overflow-hidden rounded-lg bg-muted">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 192px"
              priority={priority}
            />
          </div>
        )}
      </div>
    </div>
  );
}
