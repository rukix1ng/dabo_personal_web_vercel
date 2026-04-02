import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET - 获取所有论文（公开API）
export async function GET() {
  try {
    const papers = await query(
      `SELECT id, title_en, title_zh, title_ja,
              author, journal_name, image,
              description_en, description_zh, description_ja,
              paper_link, sponsor_en, sponsor_zh, sponsor_ja,
              sponsor_link, created_at, updated_at
       FROM papers
       ORDER BY created_at DESC`
    );

    return NextResponse.json(
      { papers },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
      }
    );
  } catch (error) {
    console.error("Error fetching papers:", error);
    return NextResponse.json(
      { error: "Failed to fetch papers" },
      { status: 500 }
    );
  }
}
