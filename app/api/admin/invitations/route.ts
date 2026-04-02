import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';

interface InvitationAdminRow {
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
    display_title_en: string | null;
    display_title_zh: string | null;
    display_title_ja: string | null;
    event_time: string | null;
    image: string | null;
    poster: string | null;
    video_link: string | null;
    youtube_link: string | null;
    created_at: string;
    updated_at: string;
}

// GET /api/admin/invitations - Get all invitations
export async function GET() {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const invitations = await query<InvitationAdminRow>(
            `SELECT id, title_en, subtitle_en, speaker_en, speaker_institution_en, abstract_en,
                    title_zh, subtitle_zh, speaker_zh, speaker_institution_zh, abstract_zh,
                    title_ja, subtitle_ja, speaker_ja, speaker_institution_ja, speaker_institution_link, abstract_ja,
                    display_title_en, display_title_zh, display_title_ja,
                    event_time, image, poster, video_link, youtube_link, created_at, updated_at
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
            display_title_en, display_title_zh, display_title_ja,
            event_time, image, poster, video_link, youtube_link
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
                display_title_en, display_title_zh, display_title_ja,
                event_time, image, poster, video_link, youtube_link
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title_en, subtitle_en || null, speaker_en, speaker_institution_en || null, abstract_en || null,
                title_zh, subtitle_zh || null, speaker_zh, speaker_institution_zh || null, abstract_zh || null,
                title_ja, subtitle_ja || null, speaker_ja, speaker_institution_ja || null, speaker_institution_link || null, abstract_ja || null,
                display_title_en || null, display_title_zh || null, display_title_ja || null,
                event_time || null, image || null, poster || null, video_link || null, youtube_link || null
            ]
        );

        const insertId = (result as { insertId?: number })?.insertId;

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
