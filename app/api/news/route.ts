import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { query } from "@/lib/db";
import { content, type Locale } from "@/lib/i18n";
import { extractDateTimeParts } from "@/lib/date-time";
import { resolveNewsHref } from "@/lib/news-links";

type NewsRecord = RowDataPacket & {
  id: number;
  title_en: string;
  title_zh: string;
  title_ja: string;
  link_type: string;
  link_value: string | null;
  news_date: string | Date;
};

type CountRow = RowDataPacket & {
  count: number;
};

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

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

function formatDateValue(value: string | Date) {
  const parts = extractDateTimeParts(value);
  if (!parts) return "";

  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  return `${parts.year}-${month}-${day}`;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const localeParam = searchParams.get("locale") || "en";
    const locale = (localeParam in content ? localeParam : "en") as Locale;
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const pageSize = Math.min(50, parsePositiveInt(searchParams.get("pageSize"), 10));
    const offset = (page - 1) * pageSize;

    const [countRows, rows] = await Promise.all([
      query<CountRow>("SELECT COUNT(*) AS count FROM news WHERE show_in_featured = FALSE"),
      query<NewsRecord>(
        `SELECT id, title_en, title_zh, title_ja, link_type, link_value, news_date
         FROM news
         WHERE show_in_featured = FALSE
         ORDER BY news_date DESC, id DESC
         LIMIT ? OFFSET ?`,
        [pageSize, offset]
      ),
    ]);

    const totalItems = Number(countRows[0]?.count ?? 0);
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const items = rows.map((item) => ({
      id: `news-${item.id}`,
      title: pickLocalizedTitle(locale, item),
      date: formatDateValue(item.news_date),
      ...resolveNewsHref(locale, item.link_type, item.link_value),
    }));

    return NextResponse.json(
      {
        items,
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages,
          hasMore: page < totalPages,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching public homepage news:", error);
    return NextResponse.json({ error: "Failed to fetch homepage news" }, { status: 500 });
  }
}
