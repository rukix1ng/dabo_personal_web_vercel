import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

type InvitationRecord = Record<string, unknown>;

// GET /api/invitations - Get all invitations (public)
export async function GET() {
    try {
        const invitations = await query<InvitationRecord>(
            `SELECT id, title_en, title_zh, title_ja,
                    description_en, description_zh, description_ja,
                    event_time, location_en, location_zh, location_ja,
                    organizer_en, organizer_zh, organizer_ja,
                    image, created_at, updated_at
             FROM invitation
             ORDER BY event_time DESC, id DESC`
        );

        return NextResponse.json(
            { invitations },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
                }
            }
        );
    } catch (error) {
        console.error('Error fetching invitations:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
