import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

type RouteContext = {
    params: Promise<{ id: string }>;
};

// GET /api/invitations/[id] - Get single invitation (public)
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;

        const invitations = await query<any>(
            `SELECT id, title_en, subtitle_en, speaker_en, speaker_institution_en, abstract_en,
                    title_zh, subtitle_zh, speaker_zh, speaker_institution_zh, abstract_zh,
                    title_ja, subtitle_ja, speaker_ja, speaker_institution_ja, speaker_institution_link, abstract_ja,
                    event_time, image, video_link
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
