import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from 'next/cache';
import type { ResultSetHeader } from "mysql2/promise";
import { query } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

// GET - 获取所有论文
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const papers = await query(
      `SELECT id, title_en, title_zh, title_ja,
              author, journal_name, image, image_en,
              description_en, description_zh, description_ja,
              paper_link, sponsor_en, sponsor_zh, sponsor_ja,
              sponsor_link, created_at, updated_at
       FROM papers
       ORDER BY created_at DESC`
    );

    return NextResponse.json({ papers });
  } catch (error) {
    console.error("Error fetching papers:", error);
    return NextResponse.json(
      { error: "Failed to fetch papers" },
      { status: 500 }
    );
  }
}

// POST - 创建新论文
export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title_en,
      title_zh,
      title_ja,
      author,
      journal_name,
      image,
      image_en,
      description_en,
      description_zh,
      description_ja,
      paper_link,
      sponsor_en,
      sponsor_zh,
      sponsor_ja,
      sponsor_link,
    } = body;

    // 验证必填字段
    if (!title_en || !title_zh || !title_ja) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await query<ResultSetHeader>(
      `INSERT INTO papers (
        title_en, title_zh, title_ja,
        author, journal_name, image, image_en,
        description_en, description_zh, description_ja,
        paper_link, sponsor_en, sponsor_zh, sponsor_ja, sponsor_link
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title_en,
        title_zh,
        title_ja,
        author || null,
        journal_name || null,
        image || null,
        image_en || null,
        description_en || null,
        description_zh || null,
        description_ja || null,
        paper_link || null,
        sponsor_en || null,
        sponsor_zh || null,
        sponsor_ja || null,
        sponsor_link || null,
      ]
    );

    // 立即刷新相关页面的缓存
    revalidatePath('/[locale]/papers', 'page');

    return NextResponse.json(
      { message: "Paper created successfully", id: result[0]?.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating paper:", error);
    return NextResponse.json(
      { error: "Failed to create paper" },
      { status: 500 }
    );
  }
}
