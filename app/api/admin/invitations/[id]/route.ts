import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';

type RouteContext = {
    params: Promise<{ id: string }>;
};

// PUT /api/admin/invitations/[id] - Update invitation
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;
        const body = await request.json();
        const {
            title_en, subtitle_en, speaker_en, speaker_institution_en, abstract_en,
            title_zh, subtitle_zh, speaker_zh, speaker_institution_zh, abstract_zh,
            title_ja, subtitle_ja, speaker_ja, speaker_institution_ja, speaker_institution_link, abstract_ja,
            display_title_en, display_title_zh, display_title_ja,
            event_time, image, image_en, poster, poster_en, video_link, youtube_link
        } = body;

        if (!title_en || !speaker_en || !title_zh || !speaker_zh || !title_ja || !speaker_ja) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        await query(
            `UPDATE invitation SET
                title_en = ?, subtitle_en = ?, speaker_en = ?, speaker_institution_en = ?, abstract_en = ?,
                title_zh = ?, subtitle_zh = ?, speaker_zh = ?, speaker_institution_zh = ?, abstract_zh = ?,
                title_ja = ?, subtitle_ja = ?, speaker_ja = ?, speaker_institution_ja = ?, speaker_institution_link = ?, abstract_ja = ?,
                display_title_en = ?, display_title_zh = ?, display_title_ja = ?,
                event_time = ?, image = ?, image_en = ?, poster = ?, poster_en = ?, video_link = ?, youtube_link = ?
            WHERE id = ?`,
            [
                title_en, subtitle_en || null, speaker_en, speaker_institution_en || null, abstract_en || null,
                title_zh, subtitle_zh || null, speaker_zh, speaker_institution_zh || null, abstract_zh || null,
                title_ja, subtitle_ja || null, speaker_ja, speaker_institution_ja || null, speaker_institution_link || null, abstract_ja || null,
                display_title_en || null, display_title_zh || null, display_title_ja || null,
                event_time || null, image || null, image_en || null, poster || null, poster_en || null, video_link || null, youtube_link || null,
                parseInt(id)
            ]
        );

        // 立即刷新相关页面的缓存
        revalidatePath('/[locale]/forum', 'page');
        revalidatePath(`/[locale]/forum/${id}`, 'page');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating invitation:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/invitations/[id] - Delete invitation
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;

        await query('DELETE FROM invitation WHERE id = ?', [parseInt(id)]);

        // 立即刷新相关页面的缓存
        revalidatePath('/[locale]/forum', 'page');
        revalidatePath(`/[locale]/forum/${id}`, 'page');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting invitation:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
