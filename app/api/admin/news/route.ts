import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { query } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { parseInternalLinkValue } from "@/lib/news-links";

type CountRow = RowDataPacket & {
  count: number;
};

type InternalOptionRow = RowDataPacket & {
  id: number;
  title_zh: string;
};

type CreateNewsPayload = {
  title_en?: string;
  title_zh?: string;
  title_ja?: string;
  link_type?: string;
  link_value?: string | null;
  news_date?: string | null;
  image?: string | null;
  show_in_featured?: boolean;
};

function revalidateHomepage() {
  revalidatePath("/[locale]", "page");
  revalidatePath("/en", "page");
  revalidatePath("/ja", "page");
}

async function getFeaturedCount() {
  const rows = await query<CountRow>(
    "SELECT COUNT(*) AS count FROM news WHERE show_in_featured = TRUE"
  );
  return Number(rows[0]?.count ?? 0);
}

function validatePayload(body: CreateNewsPayload) {
  if (!body.title_zh?.trim() || !body.title_en?.trim() || !body.title_ja?.trim()) {
    return "Missing required title fields";
  }

  if (body.show_in_featured && !body.image?.trim()) {
    return "Featured news must include an image";
  }

  if (!body.link_type || !["none", "external", "internal"].includes(body.link_type)) {
    return "Invalid link type";
  }

  if (body.link_type === "external") {
    if (!body.link_value?.trim()) {
      return "External link is required";
    }

    try {
      const url = new URL(body.link_value);
      if (!["http:", "https:"].includes(url.protocol)) {
        return "External link must use http or https";
      }
    } catch {
      return "Invalid external link";
    }
  }

  if (body.link_type === "internal") {
    const parsed = parseInternalLinkValue(body.link_value);
    if (!parsed) {
      return "Invalid internal link target";
    }
  }

  return null;
}

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [newsItems, invitations, newsColumns] = await Promise.all([
      query(
        `SELECT id, title_en, title_zh, title_ja, link_type, link_value, news_date, image, show_in_featured,
                created_at, updated_at
         FROM news
         ORDER BY show_in_featured DESC, news_date DESC, id DESC`
      ),
      query<InternalOptionRow>(
        `SELECT id, title_zh
         FROM invitation
         ORDER BY event_time DESC, id DESC`
      ),
      query<InternalOptionRow>(
        `SELECT id, title_zh
         FROM news_column
         ORDER BY series_number DESC, id DESC`
      ),
    ]);

    return NextResponse.json({
      newsItems,
      internalOptions: {
        invitations,
        newsColumns,
      },
    });
  } catch (error) {
    console.error("Error fetching homepage news:", error);
    return NextResponse.json({ error: "Failed to fetch homepage news" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CreateNewsPayload;
    const validationError = validatePayload(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (body.show_in_featured) {
      const featuredCount = await getFeaturedCount();
      if (featuredCount >= 3) {
        return NextResponse.json(
          { error: "At most 3 news items can be shown in the featured module" },
          { status: 400 }
        );
      }
    }

    const result = await query<ResultSetHeader>(
      `INSERT INTO news (title_en, title_zh, title_ja, link_type, link_value, news_date, image, show_in_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.title_en?.trim(),
        body.title_zh?.trim(),
        body.title_ja?.trim(),
        body.link_type,
        body.link_value?.trim() || null,
        body.news_date || null,
        body.image?.trim() || null,
        Boolean(body.show_in_featured),
      ]
    );

    revalidateHomepage();

    return NextResponse.json({ success: true, id: result[0]?.insertId }, { status: 201 });
  } catch (error) {
    console.error("Error creating homepage news:", error);
    return NextResponse.json({ error: "Failed to create homepage news" }, { status: 500 });
  }
}
