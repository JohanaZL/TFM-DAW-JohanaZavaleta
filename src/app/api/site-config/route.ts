import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET() {
  const config = await prisma.siteConfig.upsert({
    where: { id: 'main' },
    update: {},
    create: { id: 'main', homeParagraph: '' },
  });
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  let body: { homeParagraph?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const config = await prisma.siteConfig.upsert({
    where: { id: 'main' },
    update: { homeParagraph: body.homeParagraph ?? '' },
    create: { id: 'main', homeParagraph: body.homeParagraph ?? '' },
  });

  return NextResponse.json(config);
}
