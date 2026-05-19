import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

export interface SessionPayload {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
}

function getSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.JWT_SECRET ?? 'fallback-secret-change-me'
  );
}

export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get('auth-token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
