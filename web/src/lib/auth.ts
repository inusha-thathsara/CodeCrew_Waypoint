import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_waypoint_jwt_key_2026';

export interface UserSession {
  userId: number;
  email: string;
  name: string;
  role: 'DISPATCHER' | 'STORE_MANAGER' | 'LOADER' | 'DRIVER' | string;
  assignedScope: string;
}

export function signToken(payload: UserSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch {
    return null;
  }
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    // Check against bcrypt hash
    const match = await bcrypt.compare(plain, hash);
    if (match) return true;
  } catch {
    // ignore
  }
  // Default hackathon credential fallback
  if (plain === 'waypoint2026') {
    return true;
  }
  return false;
}

export function getSessionFromRequest(req: NextRequest): UserSession | null {
  // Check Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const session = verifyToken(token);
    if (session) return session;
  }

  // Check cookie
  const cookieToken = req.cookies.get('waypoint_token')?.value;
  if (cookieToken) {
    return verifyToken(cookieToken);
  }

  return null;
}
