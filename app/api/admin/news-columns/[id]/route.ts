import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';

type NewsColumnRecord = Record<string, unknown>;

// GET /api/admin/news-columns/[id] - Get single news column
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const newsColumns = await query<NewsColumnRecord>(
            'SELECT * FROM news_column WHERE id = ?',
            [id]
        );

        if (newsColumns.length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({ newsColumn: newsColumns[0] });
    } catch (error) {
        console.error('Error fetching news column:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/news-columns/[id] - Update news column
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const {
            title_en, title_zh, title_ja,
            display_title_en, display_title_zh, display_title_ja,
            content_en, content_zh, content_ja,
            journal_name_en, journal_name_zh, journal_name_ja,
            author_bio_en, author_bio_zh, author_bio_ja,
            publish_date, series_number, image, image_en
        } = body;

        await query(
            `UPDATE news_column SET
                title_en = ?, title_zh = ?, title_ja = ?,
                display_title_en = ?, display_title_zh = ?, display_title_ja = ?,
                content_en = ?, content_zh = ?, content_ja = ?,
                journal_name_en = ?, journal_name_zh = ?, journal_name_ja = ?,
                author_bio_en = ?, author_bio_zh = ?, author_bio_ja = ?,
                publish_date = ?, series_number = ?, image = ?, image_en = ?
            WHERE id = ?`,
            [
                title_en, title_zh, title_ja,
                display_title_en || null, display_title_zh || null, display_title_ja || null,
                content_en || null, content_zh || null, content_ja || null,
                journal_name_en, journal_name_zh, journal_name_ja,
                author_bio_en || null, author_bio_zh || null, author_bio_ja || null,
                publish_date || null, series_number, image || null, image_en || null,
                id
            ]
        );

        // 立即刷新相关页面的缓存
        revalidatePath('/[locale]/achievements', 'page');
        revalidatePath(`/[locale]/achievements/${id}`, 'page');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating news column:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/news-columns/[id] - Delete news column
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await query('DELETE FROM news_column WHERE id = ?', [id]);

        // 立即刷新相关页面的缓存
        revalidatePath('/[locale]/achievements', 'page');
        revalidatePath(`/[locale]/achievements/${id}`, 'page');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting news column:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
