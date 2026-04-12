import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

type RouteContext = {
    params: Promise<{ id: string }>;
};

interface InvitationDetailRow {
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
    event_time: string | null;
    image: string | null;
    image_en: string | null;
    poster: string | null;
    poster_en: string | null;
    video_link: string | null;
    youtube_link: string | null;
}

// GET /api/invitations/[id] - Get single invitation (public)
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;

        const invitations = await query<InvitationDetailRow>(
            `SELECT id, title_en, subtitle_en, speaker_en, speaker_institution_en, abstract_en,
                    title_zh, subtitle_zh, speaker_zh, speaker_institution_zh, abstract_zh,
                    title_ja, subtitle_ja, speaker_ja, speaker_institution_ja, speaker_institution_link, abstract_ja,
                    event_time, image, image_en, poster, poster_en, video_link, youtube_link
             FROM invitation
             WHERE id = ?`,
            [parseInt(id)]
        );

        if (invitations.length === 0) {
            return NextResponse.json(
                { error: 'Invitation not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { invitation: invitations[0] },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
                }
            }
        );
    } catch (error) {
        console.error('Error fetching invitation:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
