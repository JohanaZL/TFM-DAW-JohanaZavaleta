import bcryptjs from 'bcryptjs';
import { cookies } from 'next/headers';
import { createToken, verifyToken, SessionPayload } from './jwt';

export type { SessionPayload } from './jwt';
export { createToken, verifyToken, getSessionFromRequest } from './jwt';

export async function hashPassword(plain: string): Promise<string> {
  return bcryptjs.hash(plain, 10);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcryptjs.compare(plain, hashed);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function validateName(name: string): string | null {
  if (!name || name.trim().length === 0) return 'El nombre es requerido';
  if (!/^[a-zA-Z0-9\s]+$/.test(name.trim())) return 'El nombre no puede contener caracteres especiales';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'La contraseña es requerida';
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password)) {
    return 'La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número';
  }
  return null;
}
