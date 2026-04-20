import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { RowDataPacket } from "mysql2/promise";
import { query } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { parseInternalLinkValue } from "@/lib/news-links";

type CountRow = RowDataPacket & {
  count: number;
};

type NewsPayload = {
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

async function getFeaturedCountExcluding(id: number) {
  const rows = await query<CountRow>(
    "SELECT COUNT(*) AS count FROM news WHERE show_in_featured = TRUE AND id <> ?",
    [id]
  );
  return Number(rows[0]?.count ?? 0);
}

function validatePayload(body: NewsPayload) {
  if (!body.title_zh?.trim() || !body.title_en?.trim() || !body.title_ja?.trim()) {
    return "Missing required title fields";
  }

  if (!body.news_date?.trim()) {
    return "News date is required";
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const rows = await query("SELECT * FROM news WHERE id = ?", [Number(id)]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    return NextResponse.json({ newsItem: rows[0] });
  } catch (error) {
    console.error("Error fetching homepage news item:", error);
    return NextResponse.json({ error: "Failed to fetch homepage news item" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const newsId = Number(id);
    const body = (await request.json()) as NewsPayload;
    const validationError = validatePayload(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (body.show_in_featured) {
      const featuredCount = await getFeaturedCountExcluding(newsId);
      if (featuredCount >= 3) {
        return NextResponse.json(
          { error: "At most 3 news items can be shown in the featured module" },
          { status: 400 }
        );
      }
    }

    await query(
      `UPDATE news
       SET title_en = ?, title_zh = ?, title_ja = ?, link_type = ?, link_value = ?, news_date = ?, image = ?, show_in_featured = ?
       WHERE id = ?`,
      [
        body.title_en?.trim(),
        body.title_zh?.trim(),
        body.title_ja?.trim(),
        body.link_type,
        body.link_value?.trim() || null,
        body.news_date.trim(),
        body.image?.trim() || null,
        Boolean(body.show_in_featured),
        newsId,
      ]
    );

    revalidateHomepage();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating homepage news:", error);
    return NextResponse.json({ error: "Failed to update homepage news" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await query("DELETE FROM news WHERE id = ?", [Number(id)]);

    revalidateHomepage();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting homepage news:", error);
    return NextResponse.json({ error: "Failed to delete homepage news" }, { status: 500 });
  }
}
