import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

interface Props { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Props) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { select: { id: true, mimeType: true, fileName: true, isMain: true, productId: true } },
            },
          },
        },
      },
      user: { select: { name: true, email: true } },
    },
  });

  if (!order) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });

  // Only the owner or admin can view the order
  if (order.userId !== session.id && session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  return NextResponse.json(order);
}
