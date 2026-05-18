import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, validateName, validatePassword, createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const { name, email, password } = body;

  const nameError = validateName(name ?? '');
  if (nameError) return NextResponse.json({ error: nameError }, { status: 422 });

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'El correo electrónico no es válido' }, { status: 422 });
  }

  const passError = validatePassword(password ?? '');
  if (passError) return NextResponse.json({ error: passError }, { status: 422 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Ya existe una cuenta con ese correo electrónico' }, { status: 409 });
  }

  const hashed = await hashPassword(password!);
  const user = await prisma.user.create({
    data: { name: name!.trim(), email, password: hashed },
  });

  const token = await createToken({ id: user.id, email: user.email, role: user.role, name: user.name });

  const response = NextResponse.json(
    { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
    { status: 201 }
  );
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return response;
}
