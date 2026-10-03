import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signToken, verifyPassword, UserSession } from '@/lib/auth';

// Pre-seeded fallback user accounts matching db/init.sql
const FALLBACK_USERS: Record<string, UserSession & { passwordHash: string }> = {
  'dispatcher@waypoint.lk': {
    userId: 1,
    email: 'dispatcher@waypoint.lk',
    name: 'Nimali Perera',
    role: 'DISPATCHER',
    assignedScope: 'Kandy Central Depot',
    passwordHash: '$2a$10$wT3x9eI8V1K1sW8fA3jNuuG1j0P2z1Q7x9E8V1K1sW8fA3jNuuG1j',
  },
  'manager.out077@waypoint.lk': {
    userId: 2,
    email: 'manager.out077@waypoint.lk',
    name: 'Aravinda Silva',
    role: 'STORE_MANAGER',
    assignedScope: 'OUT077',
    passwordHash: '$2a$10$wT3x9eI8V1K1sW8fA3jNuuG1j0P2z1Q7x9E8V1K1sW8fA3jNuuG1j',
  },
  'loader.kiosk@waypoint.lk': {
    userId: 3,
    email: 'loader.kiosk@waypoint.lk',
    name: 'Samantha Perera',
    role: 'LOADER',
    assignedScope: 'Kandy Depot Bay 2',
    passwordHash: '$2a$10$wT3x9eI8V1K1sW8fA3jNuuG1j0P2z1Q7x9E8V1K1sW8fA3jNuuG1j',
  },
  'driver.kasun@waypoint.lk': {
    userId: 4,
    email: 'driver.kasun@waypoint.lk',
    name: 'Kasun Silva',
    role: 'DRIVER',
    assignedScope: 'VEH057',
    passwordHash: '$2a$10$wT3x9eI8V1K1sW8fA3jNuuG1j0P2z1Q7x9E8V1K1sW8fA3jNuuG1j',
  },
};

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user: UserSession | null = null;
    let passwordValid = false;

    // 1. Fast-path check: Seeded operational accounts with standard password (instant response, no DB socket stall)
    if (FALLBACK_USERS[normalizedEmail] && password === 'waypoint2026') {
      const fallback = FALLBACK_USERS[normalizedEmail];
      user = {
        userId: fallback.userId,
        email: fallback.email,
        name: fallback.name,
        role: fallback.role,
        assignedScope: fallback.assignedScope,
      };
      passwordValid = true;
    } else {
      // 2. Query database with a 600ms timeout so an offline database never blocks the client UI
      try {
        const dbPromise = db.user.findUnique({
          where: { email: normalizedEmail },
        });
        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('DB_TIMEOUT')), 600)
        );
        const dbUser = (await Promise.race([dbPromise, timeoutPromise])) as any;

        if (dbUser) {
          passwordValid = await verifyPassword(password, dbUser.password_hash);
          if (passwordValid) {
            user = {
              userId: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
              role: dbUser.role as any,
              assignedScope: dbUser.assigned_scope,
            };
          }
        }
      } catch (dbErr) {
        console.warn('Database query failed or timed out during login, checking seeded fallback:', dbErr);
      }

      // 3. Fallback verification if DB is offline or returned no user
      if (!user && FALLBACK_USERS[normalizedEmail]) {
        const fallback = FALLBACK_USERS[normalizedEmail];
        passwordValid = await verifyPassword(password, fallback.passwordHash);
        if (passwordValid) {
          user = {
            userId: fallback.userId,
            email: fallback.email,
            name: fallback.name,
            role: fallback.role,
            assignedScope: fallback.assignedScope,
          };
        }
      }
    }

    if (!user || !passwordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password. Default is waypoint2026' },
        { status: 401 }
      );
    }

    const token = signToken(user);

    const response = NextResponse.json({
      success: true,
      token,
      user,
      redirectUrl: getRedirectUrlForRole(user.role),
    });

    // Set cookie for seamless SSR & browser navigation
    response.cookies.set('waypoint_token', token, {
      httpOnly: false, // Accessible to client-side scripts as well
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error?.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}

function getRedirectUrlForRole(role: string): string {
  switch (role) {
    case 'DISPATCHER':
      return '/dispatcher';
    case 'STORE_MANAGER':
      return '/store-manager';
    case 'LOADER':
      return '/loader';
    case 'DRIVER':
      return '/driver';
    default:
      return '/';
  }
}
