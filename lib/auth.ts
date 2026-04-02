import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export interface AdminUser {
    id: number;
    username: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
    return hash(password, 10);
}

// Verify password
export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return compare(password, hashedPassword);
}

// Create JWT token
export async function createToken(user: AdminUser): Promise<string> {
    return new SignJWT({ userId: user.id, username: user.username })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(JWT_SECRET);
}

// Verify JWT token
export async function verifyToken(token: string): Promise<AdminUser | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return {
            id: payload.userId as number,
            username: payload.username as string,
        };
    } catch {
        return null;
    }
}

// Get current admin user from cookies
export async function getCurrentAdmin(): Promise<AdminUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
        return null;
    }

    return verifyToken(token);
}

// Set admin token cookie
export async function setAdminToken(token: string) {
    const cookieStore = await cookies();
    cookieStore.set('admin_token', token, {
        httpOnly: true,
        // FIXME: Temporarily fail to false to allow login over HTTP (IP address)
        // Revert to process.env.NODE_ENV === 'production' once SSL is set up
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
    });
}

// Clear admin token cookie
export async function clearAdminToken() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_token');
}
