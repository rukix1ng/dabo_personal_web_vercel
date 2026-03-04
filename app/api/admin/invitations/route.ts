import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';

// GET /api/admin/invitations - Get all invitations
export async function GET(request: NextRequest) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const invitations = await query<any>(
            `SELECT id, title_en, subtitle_en, speaker_en, speaker_institution_en, abstract_en,
                    title_zh, subtitle_zh, speaker_zh, speaker_institution_zh, abstract_zh,
                    title_ja, subtitle_ja, speaker_ja, speaker_institution_ja, speaker_institution_link, abstract_ja,
                    event_time, image, video_link, created_at, updated_at
             FROM invitation
             ORDER BY event_time DESC, id DESC`
        );

        return NextResponse.json({ invitations });
    } catch (error) {
        console.error('Error fetching invitations:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/admin/invitations - Create new invitation
export async function POST(request: NextRequest) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            title_en, subtitle_en, speaker_en, speaker_institution_en, abstract_en,
            title_zh, subtitle_zh, speaker_zh, speaker_institution_zh, abstract_zh,
            title_ja, subtitle_ja, speaker_ja, speaker_institution_ja, speaker_institution_link, abstract_ja,
            event_time, image, video_link
        } = body;

        if (!title_en || !speaker_en || !title_zh || !speaker_zh || !title_ja || !speaker_ja) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const result = await query(
            `INSERT INTO invitation (
                title_en, subtitle_en, speaker_en, speaker_institution_en, abstract_en,
                title_zh, subtitle_zh, speaker_zh, speaker_institution_zh, abstract_zh,
                title_ja, subtitle_ja, speaker_ja, speaker_institution_ja, speaker_institution_link, abstract_ja,
                event_time, image, video_link
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title_en, subtitle_en || null, speaker_en, speaker_institution_en || null, abstract_en || null,
                title_zh, subtitle_zh || null, speaker_zh, speaker_institution_zh || null, abstract_zh || null,
                title_ja, subtitle_ja || null, speaker_ja, speaker_institution_ja || null, speaker_institution_link || null, abstract_ja || null,
                event_time || null, image || null, video_link || null
            ]
        );

        const insertId = (result as any).insertId;

        // 立即刷新相关页面的缓存
        revalidatePath('/[locale]/forum', 'page');

        return NextResponse.json({
            success: true,
            id: insertId,
        });
    } catch (error) {
        console.error('Error creating invitation:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
