import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

interface Props { params: Promise<{ itemId: string }> }

export async function PUT(req: NextRequest, { params }: Props) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { itemId } = await params;
  const { quantity } = await req.json();
  if (!quantity || quantity < 1) {
    return NextResponse.json({ error: 'Cantidad inválida' }, { status: 422 });
  }

  const item = await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { itemId } = await params;
  await prisma.cartItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}
