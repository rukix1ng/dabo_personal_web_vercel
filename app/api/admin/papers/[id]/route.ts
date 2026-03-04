import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from 'next/cache';
import { query } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

// GET - 获取单个论文
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const papers = await query("SELECT * FROM papers WHERE id = ?", [
      parseInt(id),
    ]);

    if (papers.length === 0) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    return NextResponse.json({ paper: papers[0] });
  } catch (error) {
    console.error("Error fetching paper:", error);
    return NextResponse.json(
      { error: "Failed to fetch paper" },
      { status: 500 }
    );
  }
}

// PUT - 更新论文
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
    const body = await request.json();
    const {
      title_en,
      title_zh,
      title_ja,
      author,
      journal_name,
      image,
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

    await query(
      `UPDATE papers SET
        title_en = ?, title_zh = ?, title_ja = ?,
        author = ?, journal_name = ?, image = ?,
        description_en = ?, description_zh = ?, description_ja = ?,
        paper_link = ?,
        sponsor_en = ?, sponsor_zh = ?, sponsor_ja = ?,
        sponsor_link = ?
      WHERE id = ?`,
      [
        title_en,
        title_zh,
        title_ja,
        author || null,
        journal_name || null,
        image || null,
        description_en || null,
        description_zh || null,
        description_ja || null,
        paper_link || null,
        sponsor_en || null,
        sponsor_zh || null,
        sponsor_ja || null,
        sponsor_link || null,
        parseInt(id),
      ]
    );

    // 立即刷新相关页面的缓存
    revalidatePath('/[locale]/papers', 'page');

    return NextResponse.json({ message: "Paper updated successfully" });
  } catch (error) {
    console.error("Error updating paper:", error);
    return NextResponse.json(
      { error: "Failed to update paper" },
      { status: 500 }
    );
  }
}

// DELETE - 删除论文
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await query("DELETE FROM papers WHERE id = ?", [parseInt(id)]);

    // 立即刷新相关页面的缓存
    revalidatePath('/[locale]/papers', 'page');

    return NextResponse.json({ message: "Paper deleted successfully" });
  } catch (error) {
    console.error("Error deleting paper:", error);
    return NextResponse.json(
      { error: "Failed to delete paper" },
      { status: 500 }
    );
  }
}
