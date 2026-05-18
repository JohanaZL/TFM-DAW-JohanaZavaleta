import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  let body: { name?: string; slug?: string; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const { name, slug, description } = body;
  if (!name || !slug) {
    return NextResponse.json({ error: 'name y slug son requeridos' }, { status: 422 });
  }

  try {
    const category = await prisma.category.create({ data: { name, slug, description } });
    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'La categoría ya existe' }, { status: 409 });
  }
}
